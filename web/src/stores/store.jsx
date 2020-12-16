import config, {pools} from "../config";
import async from "async";
import {toStringDecimals} from "../utils/numberFormat.js";
import {
    ERROR,
    CONFIGURE,
    CONFIGURE_RETURNED,
    DEPOSIT,
    DEPOSIT_RETURNED,
    GET_BALANCES_PERPETUAL,
    GET_BALANCES_PERPETUAL_RETURNED,
    TRADE,
    TRADE_RETURNED,
    WITHDRAW,
    WITHDRAW_RETURNED,
    GET_REWARDS,
    GET_REWARDS_RETURNED,
    CREATE_ENTRY_CONTRACT,
    CREATE_ENTRY_CONTRACT_RETURNED,
    CALCULATE_PRICE,
    CALCULATE_PRICE_RETURNED,
    CALCULATE_AMOUNT,
    CALCULATE_AMOUNT_RETURNED,
    CALCULATE_BPT_AMOUNT,
    CALCULATE_BPT_AMOUNT_RETURNED,
    TX_CONFIRM
} from "../constants";
import Web3 from "web3";
import {vlxToEth} from "../utils/vlxAddressConversion"
import {makeBatchRequest} from "../utils/request"
import {injected} from "./connectors";

const rp = require("request-promise");

const Dispatcher = require("flux").Dispatcher;
const Emitter = require("events").EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

const blocksPerYear = 3600*24*365/config.secPerBlock;

class Store {
    constructor() {
        this.store = {
            currentBlock: 0,
            universalGasPrice: "0.00003",
            account: {},
            web3: null,
            connectorsByName: {
                VELAS: injected,
                MetaMask: injected
            },
            web3context: null,
            languages: [
                {
                    language: "English",
                    code: "en"
                },
                {
                    language: "Chinese",
                    code: "zh"
                }
            ],
            rewardPools: pools
        };

        dispatcher.register(
            function (payload) {
                switch (payload.type) {
                    case CONFIGURE:
                        this.configure(payload);
                        break;
                    case GET_BALANCES_PERPETUAL:
                        this.getBalancesPerpetual(payload);
                        break;
                    case TRADE:
                        this.trade(payload);
                        break;
                    case DEPOSIT:
                        this.deposit(payload);
                        break;
                    case WITHDRAW:
                        this.withdraw(payload);
                        break;
                    case GET_REWARDS:
                        this.getReward(payload);
                        break;
                    case CREATE_ENTRY_CONTRACT:
                        this.createEntryContract(payload);
                        break;
                    case CALCULATE_PRICE:
                        this.calculateTokenPrice(payload);
                        break;
                    case CALCULATE_AMOUNT:
                        this.getStakeTokenPrice(payload);
                        break;
                    case CALCULATE_BPT_AMOUNT:
                        this.getBPTAmount(payload);
                        break;
                    default: {
                    }
                }
            }.bind(this)
        );
    }

    getStore(index) {
        return this.store[index];
    }

    setStore(obj) {
        this.store = {...this.store, ...obj};
        return emitter.emit("StoreUpdated");
    }

    configure = async () => {
        if (store.getStore("web3context") === null) {
            return false;
        }
        const web3 = new Web3(store.getStore("web3context"));
        const currentBlock = await web3.eth.getBlockNumber();

        store.setStore({currentBlock: currentBlock});

        window.setTimeout(() => {
            emitter.emit(CONFIGURE_RETURNED);
        }, 100);
    };

    getWeb3 = async () => {
        let web3;
        if (
            store.getStore("web3context")
        ) {
            web3 = new Web3(store.getStore("web3context"));
        } else {
            web3 = new Web3(config.rpcUrl);
        }
        try {
            const networkId = await web3.eth.net.getId();
            store.setStore({networkId});
        } catch (error) {
            console.error(error);
        }

        return web3;
    };

    getEntryContract = async id => {
        const account = store.getStore("account");
        const keyName = "entryContractAddress"+ account.address + id;

        let connectorAddress = store.getStore(keyName);
        if (
            (!connectorAddress ||
                connectorAddress ===
                    "0x0000000000000000000000000000000000000000") &&
            account &&
            account.address
        ) {
            const web3 = await this.getWeb3();
            const contract = new web3.eth.Contract(
                config.connectorFactoryABI,
                config.connectorFactory
            );
            try {
                connectorAddress = await contract.methods
                    .connectors(account.address, id)
                    .call();
                if (
                    !connectorAddress ||
                    connectorAddress ===
                        "0x0000000000000000000000000000000000000000"
                ) {
                    connectorAddress = null;
                }
                
                //Can not update in time with setStore, so directly set the attributes of the store
                //store.setStore({keyName: connectorAddress});
                this.store[keyName] = connectorAddress;
                console.log("pool: ", id, " connectorAddress: ", connectorAddress);
            } catch (err) {
                console.log(err);
            }
        }
        
        return connectorAddress;
    };

    getBalancesPerpetual = async () => {
        const pools = store.getStore("rewardPools");
        const account = store.getStore("account");
        const web3 = await this.getWeb3();
        let syxBalance;

        try {
            const currentBlock = await web3.eth.getBlockNumber();
            store.setStore({currentBlock: currentBlock});

            //The reward tokens of several pools are all syx, so make a separate request to avoid repeated requests
            syxBalance = await this.getErc20Balance(web3,config.syx,18,account);
        } catch (err) {
            console.log(err);
            return;
        }

        //Split call to reduce the total number of rpc requests
        const promises = pools.map(async (pool)=>{
            pool.entryContractAddress = await this.getEntryContract(pool.index);
            pool.rewardsBalance = syxBalance;
        });
        await Promise.all(promises);

        async.map(
            pools,
            (pool, callback) => {
                async.parallel(
                    [
                        //0
                        callbackInner => {
                            this._getStakeAmount(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //1
                        callbackInner => {
                            this._getRewardsAvailable(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //2
                        callbackInner => {
                            this._getERC20TokenPrice(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //3
                        callbackInner => {
                            this._getTokenBalance(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //4
                        callbackInner => {
                            this._getRewardRate(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //5
                        callbackInner => {
                            this._getAllocPoint(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //6
                        callbackInner => {
                            this._getStakeTokenPrice(
                                web3,
                                pool,
                                pool.erc20Address,
                                pool.erc20Decimals,
                                "1",
                                callbackInner
                            );
                        },
                        //7
                        callbackInner => {
                            this._getBptInfo(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        }
                    ],
                    (err, data) => {
                        if (err) {
                            console.log(err);
                            return callback(err, pool);
                        }
                        pool.stakeAmount = data[0];
                        pool.rewardsAvailable = data[1];
                        pool.price = data[2];
                        pool.erc20Balance = data[3].erc20Balance;
                        if(pool.erc20Address2 === pool.rewardsAddress){
                            pool.erc20Balance2 = pool.rewardsBalance;
                        }else {
                            pool.erc20Balance2 = data[3].erc20Balance2;
                        }
                        
                        pool.rewardRate = data[4] * data[5];
                        pool.allocPoint = data[5];
                        pool.BPTPrice = data[6];
                        pool.totalSupply = data[7].totalSupply;
                        pool.totalBalanceForSyx = 0;
                        if (pool.type === "seed") {
                            pool.totalBalanceForSyx =
                                parseFloat(pool.totalSupply) /
                                parseFloat(pool.price);
                        } else {
                            pool.totalBalanceForSyx =
                                parseFloat(data[7].erc20Balance) / parseFloat(pool.price) +
                                parseFloat(data[7].erc20Balance2);
                        }

                        pool.rewardApr = (pool.totalBalanceForSyx > 0
                            ? ((parseFloat(pool.rewardRate) * blocksPerYear) /
                                  pool.totalBalanceForSyx) *
                              100
                            : 0
                        ).toFixed(1);
                        
                        pool.weight = data[7].weight;

                        pool.bptVlxBalance = data[7].erc20Balance;
                        pool.bptSyxBalance = data[7].erc20Balance2;

                        pool.maxErc20In =
                            parseFloat(data[7].maxIn) * parseFloat(data[7].erc20Balance);
                        pool.maxSyxIn =
                            parseFloat(data[7].maxIn) * parseFloat(data[7].erc20Balance2);
                        pool.maxErc20Out =
                            parseFloat(data[7].maxOut) * parseFloat(data[7].erc20Balance);
                        pool.maxSyxOut =
                            parseFloat(data[7].maxOut) * parseFloat(data[7].erc20Balance2);
                        callback(null, pool);
                    }
                );
            },
            (err, poolData) => {
                //If there is a transaction pool corresponding to the seed pool, replace the price of the seed pool with the price of the transaction pool and update the rewardApr
                if (Array.isArray(poolData)) {
                    for (let i = 0; i < poolData.length; i++) {
                        if (poolData[i] && poolData[i].type === "seed") {
                            for (let j = 0; j < poolData.length; j++) {
                                if (
                                    poolData[j] && poolData[j].id === "SYX2/VLX"
                                ) {
                                    poolData[i].price = poolData[j].price;
                                    poolData[i].totalBalanceForSyx =
                                        parseFloat(poolData[i].totalSupply) /
                                        parseFloat(poolData[i].price);
                                    poolData[i].rewardApr = (poolData[i]
                                        .totalBalanceForSyx > 0
                                        ? ((parseFloat(poolData[i].rewardRate) *
                                              blocksPerYear) /
                                              poolData[i].totalBalanceForSyx) *
                                          100
                                        : 0
                                    ).toFixed(1);
                                }
                            }
                        }

                        if (poolData[i] && poolData[i].id === "USDT/VLX"){
                            for (let j = 0; j < poolData.length; j++) {
                                if (
                                    poolData[j] && poolData[j].id === "SYX2/VLX"
                                ) {
                                    const vlxSyxPrice = poolData[j].price;
                                    const totalVlx = poolData[i].totalBalanceForSyx * poolData[i].price;
                                    const totalSyx = totalVlx/vlxSyxPrice;

                                    poolData[i].rewardApr = (poolData[i]
                                        .totalBalanceForSyx > 0
                                        ? ((parseFloat(poolData[i].rewardRate) *
                                              blocksPerYear) /
                                              totalSyx *
                                          100)
                                        : 0
                                    ).toFixed(1);
                                }
                            }
                        }

                        if (poolData[i] && poolData[i].id === "ETH/VLX"){
                            for (let j = 0; j < poolData.length; j++) {
                                if (
                                    poolData[j] && poolData[j].id === "SYX2/VLX"
                                ) {
                                    const vlxSyxPrice = poolData[j].price;
                                    const totalVlx = poolData[i].totalBalanceForSyx * poolData[i].price;
                                    const totalSyx = totalVlx/vlxSyxPrice;

                                    poolData[i].rewardApr = (poolData[i]
                                        .totalBalanceForSyx > 0
                                        ? ((parseFloat(poolData[i].rewardRate) *
                                              blocksPerYear) /
                                              totalSyx *
                                          100)
                                        : 0
                                    ).toFixed(1);
                                }
                            }
                        }
                    }
                }
                if (err) {
                    console.log(err);
                }
                store.setStore({rewardPools: poolData});
                emitter.emit(GET_BALANCES_PERPETUAL_RETURNED);
            }
        );
    };

    _checkApproval = async (
        address,
        abi,
        account,
        amount,
        contract,
        callback
    ) => {
        try {
            const web3 = await this.getWeb3();
            const erc20Contract = new web3.eth.Contract(abi, address);
            const allowance = await erc20Contract.methods
                .allowance(account.address, contract)
                .call({from: account.address});

            const ethAllowance = web3.utils.fromWei(allowance, "ether");

            if (parseFloat(ethAllowance) < parseFloat(amount)) {
                await erc20Contract.methods
                    .approve(
                        contract,
                        web3.utils.toWei("999999999999999", "ether")
                    )
                    .send({
                        from: account.address,
                        gasPrice: web3.utils.toWei(
                            await this._getGasPrice(),
                            "gwei"
                        )
                    });
                callback();
            } else {
                callback();
            }
        } catch (error) {
            console.log(error);
            if (error.message) {
                return callback(error.message);
            }
            callback(error);
        }
    };

    _getStakeAmount = async (web3, asset, account, callback) => {
        const entryContractAddress = await this.getEntryContract(asset.index);

        if (!entryContractAddress) {
            callback(null, "0");
        } else {
            let contract = new web3.eth.Contract(
                asset.poolABI,
                asset.poolAddress
            );
            try {
                let userInfo = await contract.methods
                    .userInfo(asset.index, entryContractAddress)
                    .call();
                callback(
                    null,
                    toStringDecimals(userInfo.amount, asset.decimals)
                );
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    _getTokenBalance = async (web3, asset, account, callback) => {
        if (!account || !account.address) return callback(null, "0");
        if (asset.type === "seed"){
            try {
                let balance = await web3.eth.getBalance(account.address);
                callback(null, {erc20Balance:toStringDecimals(balance, asset.decimals)});
            } catch (ex) {
                return callback(ex);
            }
        }else if(asset.type === "swap-native") {
            try {
                let balance = await web3.eth.getBalance(account.address);
                if(asset.erc20Address2 === asset.rewardsAddress){
                    callback(null, {erc20Balance:toStringDecimals(balance, asset.decimals)});
                }else{
                    let erc20Contract = new web3.eth.Contract(
                        asset.erc20ABI2,
                        asset.erc20Address2
                    );

                    let balance2 = await erc20Contract.methods
                        .balanceOf(account.address)
                        .call();
                    callback(null, {
                        erc20Balance:toStringDecimals(balance, asset.decimals),erc20Balance2:toStringDecimals(balance2, asset.erc20Decimals2)});
                }
               
            } catch (ex) {
                return callback(ex);
            }
        }else {
            let erc20Contract = new web3.eth.Contract(
                asset.erc20ABI,
                asset.erc20Address
            );

            let erc20Contract2 = new web3.eth.Contract(
                asset.erc20ABI2,
                asset.erc20Address2
            );

            let balance = await erc20Contract.methods
                .balanceOf(account.address)
                .call();
            
            let balance2 = await erc20Contract2.methods
                .balanceOf(account.address)
                .call();

            callback(null, {
                erc20Balance:toStringDecimals(balance, asset.erc20Decimals),erc20Balance2:toStringDecimals(balance2, asset.erc20Decimals2)});
        }
    };

    getErc20Balance = async (web3, address, decimals, account) => {
        if (!account || !account.address) return "0";
        let erc20Contract = new web3.eth.Contract(
            config.erc20ABI,
            address
        );
        try {
            let balance = await erc20Contract.methods
                .balanceOf(account.address)
                .call();
            return toStringDecimals(balance, decimals);
        } catch (err) {
            return emitter.emit(ERROR, err);
        }
    };

    _getRewardRate = async (web3, asset, account, callback) => {
        let erc20Contract = new web3.eth.Contract(
            asset.poolABI,
            asset.poolAddress
        );
        try {
            const curBlockNumber = await web3.eth.getBlockNumber();
            let [
                rate,
                bonusEndBlock,
                startBlock,
                endBlock
            ] = await makeBatchRequest(web3,[
                erc20Contract.methods.syxPerBlock().call,
                erc20Contract.methods.bonusEndBlock().call,
                erc20Contract.methods.startBlock().call,
                erc20Contract.methods.endBlock().call
            ],account.address)

            if(parseFloat(curBlockNumber)>=parseFloat(endBlock)){
                callback(null, toStringDecimals(0, 18));
            }else if(parseFloat(curBlockNumber)<parseFloat(startBlock)){
                callback(null, toStringDecimals(0, 18));
            }else if(parseFloat(curBlockNumber)<parseFloat(bonusEndBlock)){
                const bonusMultiplier = await erc20Contract.methods.BONUS_MULTIPLIER().call();
                callback(null, toStringDecimals(parseFloat(rate)*parseFloat(bonusMultiplier), 18));
            }else{
                callback(null, toStringDecimals(rate, 18));
            }    
        } catch (ex) {
            return callback(ex);
        }
    };

    _getAllocPoint = async (web3, asset, account, callback) => {
        let erc20Contract = new web3.eth.Contract(
            asset.poolABI,
            asset.poolAddress
        );  
        try {
            let [
                totalAllocPoint,
                poolInfo
            ] = await makeBatchRequest(web3,[
                erc20Contract.methods.totalAllocPoint().call,
                erc20Contract.methods.poolInfo(asset.index).call
            ],account.address)

            callback(null, poolInfo.allocPoint / totalAllocPoint);
        } catch (ex) {
            return callback(ex);
        }
    };

    calculateTokenPrice = async payload => {
        const account = store.getStore("account");
        const {
            asset,
            tokenIn,
            tokenOut,
            tokenName,
            type,
            amount
        } = payload.content;
        this._calculateTokenPrice(
            asset,
            account,
            tokenIn,
            tokenOut,
            tokenName,
            type,
            amount,
            (err, res) => {
                if (err) {
                    return emitter.emit(ERROR, err);
                }

                return emitter.emit(CALCULATE_PRICE_RETURNED, res);
            }
        );
    };

    _calculateTokenPrice = async (
        asset,
        account,
        tokenIn,
        tokenOut,
        tokenName,
        type,
        amount,
        callback
    ) => {
        const web3 = await this.getWeb3();
        let bptContract = new web3.eth.Contract(asset.abi, asset.address);
        try {
            let [
                balanceIn,
                denormIn,
                balanceOut,
                denormOut,
                swapFee
            ] = await makeBatchRequest(web3,[
                bptContract.methods.getBalance(tokenIn).call,
                bptContract.methods.getDenormalizedWeight(tokenIn).call,
                bptContract.methods.getBalance(tokenOut).call,
                bptContract.methods.getDenormalizedWeight(tokenOut).call,
                bptContract.methods.getSwapFee().call
            ],account.address)

            let amountToWei, finallPriceDecimals = 18;
            if (type === "sell") {
                if(tokenIn === asset.erc20Address && asset.erc20Decimals !==18){
                    amountToWei = parseInt(amount * Number(`1e+${asset.erc20Decimals}`)).toLocaleString('fullwide', {useGrouping:false});
                    finallPriceDecimals = asset.erc20Decimals;
                }else if(tokenIn === asset.erc20Address2 && asset.erc20Decimals2 !==18){
                    amountToWei = parseInt(amount * Number(`1e+${asset.erc20Decimals2}`)).toLocaleString('fullwide', {useGrouping:false});
                    finallPriceDecimals = asset.erc20Decimals2;
                }else{
                    amountToWei = web3.utils.toWei(amount + "", "ether");
                }

                let tokenAmountOut = await bptContract.methods
                    .calcOutGivenIn(
                        balanceIn,
                        denormIn,
                        balanceOut,
                        denormOut,
                        amountToWei,
                        swapFee
                    )
                    .call({from: account.address});

                let calcInAmount,calcOutAmount,tradePrice;
                if(tokenIn === asset.erc20Address && asset.erc20Decimals !==18){
                    const inAmount = parseFloat(parseFloat(balanceIn/Number(`1e+${asset.erc20Decimals}`)) + amount);
                    calcInAmount = parseInt( inAmount * Number(`1e+${asset.erc20Decimals}`)).toLocaleString('fullwide', {useGrouping:false});
                }else if(tokenIn === asset.erc20Address2 && asset.erc20Decimals2 !==18){
                    const inAmount = parseFloat(parseFloat(balanceIn/Number(`1e+${asset.erc20Decimals2}`)) + amount);
                    calcInAmount = parseInt( inAmount * Number(`1e+${asset.erc20Decimals2}`)).toLocaleString('fullwide', {useGrouping:false});
                }else{
                    calcInAmount = web3.utils.toWei(
                        parseFloat(web3.utils.fromWei(balanceIn, "ether")) +
                            amount +
                            "",
                        "ether"
                    );
                }

                if(tokenOut === asset.erc20Address && asset.erc20Decimals !==18){
                    const outAmount = parseFloat(balanceOut/Number(`1e+${asset.erc20Decimals}`)) - parseFloat(tokenAmountOut/Number(`1e+${asset.erc20Decimals}`));
                    calcOutAmount = parseInt( outAmount * Number(`1e+${asset.erc20Decimals}`)).toLocaleString('fullwide', {useGrouping:false});
                    tradePrice = (tokenAmountOut / Number(`1e+${asset.erc20Decimals}`)) / amount;
                }else if(tokenOut === asset.erc20Address2 && asset.erc20Decimals2 !==18){
                    const outAmount = parseFloat(balanceOut/Number(`1e+${asset.erc20Decimals2}`)) - parseFloat(tokenAmountOut/Number(`1e+${asset.erc20Decimals2}`));
                    calcOutAmount = parseInt( outAmount * Number(`1e+${asset.erc20Decimals2}`)).toLocaleString('fullwide', {useGrouping:false});
                    tradePrice = (tokenAmountOut / Number(`1e+${asset.erc20Decimals2}`)) / amount;
                }else{
                    calcOutAmount = web3.utils.toWei(
                        parseFloat(
                            web3.utils.fromWei(balanceOut, "ether")
                        ) -
                            parseFloat(
                                web3.utils.fromWei(tokenAmountOut, "ether")
                            ) +
                            "",
                        "ether"
                    );
                    //Trading price
                    tradePrice = web3.utils.fromWei(tokenAmountOut + "", "ether") / amount;
                }

                //Post-trade price
                let finallPrice = await bptContract.methods
                    .calcSpotPrice(
                        calcInAmount,
                        denormIn,
                        calcOutAmount,
                        denormOut,
                        swapFee
                    )
                    .call({from: account.address});
                finallPrice = toStringDecimals(finallPrice, finallPriceDecimals);

                callback(null, {
                    price: {
                        tradePrice,
                        finallPrice
                    },
                    type,
                    tokenName,
                    amount
                });
            } else if (type === "buyIn") {
                if(tokenIn === asset.erc20Address && asset.erc20Decimals !==18){
                    finallPriceDecimals = asset.erc20Decimals;
                }
                if(tokenIn === asset.erc20Address2 && asset.erc20Decimals2 !==18){
                    finallPriceDecimals = asset.erc20Decimals2;
                }

                if(tokenOut === asset.erc20Address && asset.erc20Decimals !==18){
                    amountToWei = parseInt(amount * Number(`1e+${asset.erc20Decimals}`)).toLocaleString('fullwide', {useGrouping:false});
                }else if(tokenOut === asset.erc20Address2 && asset.erc20Decimals2 !==18){
                    amountToWei = parseInt(amount * Number(`1e+${asset.erc20Decimals2}`)).toLocaleString('fullwide', {useGrouping:false});
                }else{
                    amountToWei = web3.utils.toWei(amount + "", "ether");
                }

                let tokenAmountIn = await bptContract.methods
                    .calcInGivenOut(
                        balanceIn,
                        denormIn,
                        balanceOut,
                        denormOut,
                        amountToWei,
                        swapFee
                    )
                    .call({from: account.address});

                let calcInAmount,calcOutAmount, tradePrice;
                if(tokenIn === asset.erc20Address && asset.erc20Decimals !==18){
                    const inAmount = parseFloat(balanceIn / Number(`1e+${asset.erc20Decimals}`)) + parseFloat(tokenAmountIn/ Number(`1e+${asset.erc20Decimals}`));
                    calcInAmount = parseInt( inAmount * Number(`1e+${asset.erc20Decimals}`)).toLocaleString('fullwide', {useGrouping:false});
                    tradePrice = amount * Number(`1e+${asset.erc20Decimals}`) / tokenAmountIn;
                }else if(tokenIn === asset.erc20Address2 && asset.erc20Decimals2 !==18){
                    const inAmount = parseFloat(balanceIn / Number(`1e+${asset.erc20Decimals2}`)) + parseFloat(tokenAmountIn/ Number(`1e+${asset.erc20Decimals2}`));
                    calcInAmount = parseInt( inAmount * Number(`1e+${asset.erc20Decimals2}`)).toLocaleString('fullwide', {useGrouping:false});
                    tradePrice = amount * Number(`1e+${asset.erc20Decimals2}`) / tokenAmountIn;
                }else{
                    calcInAmount = web3.utils.toWei(
                        parseFloat(web3.utils.fromWei(balanceIn, "ether")) +
                            parseFloat(
                                web3.utils.fromWei(tokenAmountIn, "ether")
                            ) +
                            "",
                        "ether"
                    );
                    tradePrice = amount / web3.utils.fromWei(tokenAmountIn + "", "ether");
                }

                if(tokenOut === asset.erc20Address && asset.erc20Decimals !==18){
                    const outAmount = parseFloat(balanceOut/Number(`1e+${asset.erc20Decimals}`)) - parseFloat(amount);
                    calcOutAmount = parseInt( outAmount * Number(`1e+${asset.erc20Decimals}`)).toLocaleString('fullwide', {useGrouping:false});        
                }else if(tokenOut === asset.erc20Address2 && asset.erc20Decimals2 !==18){
                    const outAmount = parseFloat(balanceOut/Number(`1e+${asset.erc20Decimals2}`)) - parseFloat(amount);
                    calcOutAmount = parseInt( outAmount * Number(`1e+${asset.erc20Decimals2}`)).toLocaleString('fullwide', {useGrouping:false});    
                }else{
                    calcOutAmount = web3.utils.toWei(
                        parseFloat(
                            web3.utils.fromWei(balanceOut, "ether")
                        ) -
                            amount +
                            "",
                        "ether"
                    );
                }

                //Post-trade price
                let finallPrice = await bptContract.methods
                    .calcSpotPrice(
                        calcInAmount,
                        denormIn,
                        calcOutAmount,
                        denormOut,
                        swapFee
                    )
                    .call({from: account.address});

                finallPrice = toStringDecimals(finallPrice, finallPriceDecimals);

                callback(null, {
                    price: {
                        tradePrice,
                        finallPrice
                    },
                    type,
                    tokenName,
                    amount
                });
            } else {
                callback(null, "0");
            }
        } catch (ex) {
            return callback(ex);
        }
    };

    getBPTAmount = async payload => {
        const web3 = await this.getWeb3();
        const {asset, amount, token} = payload.content;
        this._getBPTAmount(web3, asset, token, amount, (err, res) => {
            if (err) {
                return emitter.emit(ERROR, err);
            }

            return emitter.emit(CALCULATE_BPT_AMOUNT_RETURNED, res);
        });
    };

    _getBPTAmount = async (web3, asset, token, amount, callback) => {
        if (asset.type === "seed") {
            //The token deposited in the seed pool is the token pledged to the reward pool, so the price is 1
            callback(null, "0");
        } else {
            let bptContract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                let [
                    balance,
                    denorm,
                    totalSupply,
                    totalWeight,
                    swapFee
                ] = await makeBatchRequest(web3,[
                    bptContract.methods.getBalance(token).call,
                    bptContract.methods.getDenormalizedWeight(token).call,
                    bptContract.methods.totalSupply().call,
                    bptContract.methods.getTotalDenormalizedWeight().call,
                    bptContract.methods.getSwapFee().call
                ])

                let amountToWei;
                if(token === asset.erc20Address && asset.erc20Decimals!==18){
                    amountToWei = parseInt(amount * Number(`1e+${asset.erc20Decimals}`)).toLocaleString('fullwide', {useGrouping:false});
                }else if(token === asset.erc20Address2 && asset.erc20Decimals2!==18){
                    amountToWei = parseInt(amount * Number(`1e+${asset.erc20Decimals2}`)).toLocaleString('fullwide', {useGrouping:false});
                }else{
                    amountToWei = web3.utils.toWei(amount + "", "ether");
                }
                let amountOut = await bptContract.methods
                    .calcPoolInGivenSingleOut(
                        balance,
                        denorm,
                        totalSupply,
                        totalWeight,
                        amountToWei,
                        swapFee
                    )
                    .call();
                callback(null, toStringDecimals(amountOut, asset.decimals));
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    getStakeTokenPrice = async payload => {
        const web3 = await this.getWeb3();
        const {asset, amount, token} = payload.content;
        let decimals;
        if(token === asset.erc20Address){
            decimals = asset.erc20Decimals;
        }else if(token === asset.erc20Address2){
            decimals = asset.erc20Decimals2;
        }else{
            decimals = asset.decimals;
        }
        this._getStakeTokenPrice(web3, asset, token, decimals, amount, (err, res) => {
            if (err) {
                return emitter.emit(ERROR, err);
            }

            return emitter.emit(CALCULATE_AMOUNT_RETURNED, res);
        });
    };

    _getStakeTokenPrice = async (
        web3,
        asset,
        token,
        decimals = 18,
        amount = "1",
        callback
    ) => {
        if (asset.type === "seed") {
            //The token deposited in the seed pool is the token pledged to the reward pool, so the price is 1
            callback(null, "1");
        } else {
            let bptContract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                let [
                    balance,
                    denorm,
                    totalSupply,
                    totalWeight,
                    swapFee
                ] = await makeBatchRequest(web3,[
                    bptContract.methods.getBalance(token).call,
                    bptContract.methods.getDenormalizedWeight(token).call,
                    bptContract.methods.totalSupply().call,
                    bptContract.methods.getTotalDenormalizedWeight().call,
                    bptContract.methods.getSwapFee().call
                ])

                let amountOut = await bptContract.methods
                    .calcSingleOutGivenPoolIn(
                        balance,
                        denorm,
                        totalSupply,
                        totalWeight,
                        web3.utils.toWei(amount + "", "ether"),
                        swapFee
                    )
                    .call();
                callback(null, toStringDecimals(amountOut, decimals));
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    _getBptInfo = async (web3, asset, account, callback) => {
        if (asset.type === "seed") {
            try {
                let contract = new web3.eth.Contract(asset.abi, asset.address);
                const totalSupply = await contract.methods.balanceOf(asset.poolAddress).call();
                callback(null, {totalSupply: toStringDecimals(totalSupply, asset.decimals)});
            } catch (error) {
                return callback(error);
            }
            
        } else {
            let bptContract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                let [
                    maxIn,
                    maxOut,
                    weight1,
                    weight2,
                    erc20Balance2,
                    erc20Balance,
                    totalSupply
                ] = await makeBatchRequest(web3,[
                    bptContract.methods.MAX_IN_RATIO().call,
                    bptContract.methods.MAX_OUT_RATIO().call,
                    bptContract.methods.getNormalizedWeight(asset.erc20Address2).call,
                    bptContract.methods.getNormalizedWeight(asset.erc20Address).call,
                    bptContract.methods.getBalance(asset.erc20Address2).call,
                    bptContract.methods.getBalance(asset.erc20Address).call,
                    bptContract.methods.totalSupply().call
                ],account.address)

                callback(null, {
                    maxIn: toStringDecimals(maxIn, asset.decimals),
                    maxOut: toStringDecimals(maxOut, asset.decimals),
                    weight: parseInt(toStringDecimals(weight1*100, asset.decimals)) + ":" + parseInt(toStringDecimals(weight2*100, asset.decimals)),
                    erc20Balance2: toStringDecimals(erc20Balance2, asset.erc20Decimals2),
                    erc20Balance: toStringDecimals(erc20Balance, asset.erc20Decimals),
                    totalSupply: toStringDecimals(totalSupply, asset.decimals)
                });
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    _getERC20TokenPrice = async (web3, asset, account, callback) => {
        if (asset.type === "seed") {
            callback(null, "5");
        } else {
            let contract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                //calc erc20Address2 price
                let price = await contract.methods
                    .getSpotPrice(asset.erc20Address, asset.erc20Address2)
                    .call();
                let decimals = 18;
                if(asset.erc20Decimals != asset.erc20Decimals2){
                    if(asset.erc20Decimals < asset.erc20Decimals2){
                        decimals = asset.erc20Decimals;
                    }else{
                        decimals = asset.erc20Decimals + asset.erc20Decimals - asset.erc20Decimals2
                    }
                }
                callback(null, toStringDecimals(price, decimals));
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    _getRewardsAvailable = async (web3, asset, account, callback) => {
        const entryContractAddress = await this.getEntryContract(asset.index);
        if (!entryContractAddress) {
            callback(null, "0");
        } else {
            let contract = new web3.eth.Contract(
                asset.entryContractABI,
                entryContractAddress
            );

            try {
                let earned = await contract.methods.earned().call();
                callback(null, toStringDecimals(earned, 18));
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    deposit = async payload => {
        const account = store.getStore("account");
        const {asset, token, amount, referral} = payload.content;
        const entryContractAddress = await this.getEntryContract(asset.index);
        if (!entryContractAddress)
            return emitter.emit(ERROR, "connector not create");
        if (
            asset.type === "seed" ||
            (asset.type === "swap-native" && asset.erc20Address === token)
        ) {
            this._callDeposit(asset, account, token, amount, referral, (err, res) => {
                if (err) {
                    return emitter.emit(ERROR, err);
                }

                return emitter.emit(DEPOSIT_RETURNED, res);
            });
        } else {
            this._checkApproval(
                token,
                asset.erc20ABI,
                account,
                amount,
                entryContractAddress,
                err => {
                    if (err) {
                        return emitter.emit(ERROR, err);
                    }
                    this._callDeposit(
                        asset,
                        account,
                        token,
                        amount,
                        referral,
                        (err, res) => {
                            if (err) {
                                return emitter.emit(ERROR, err);
                            }

                            return emitter.emit(DEPOSIT_RETURNED, res);
                        }
                    );
                }
            );
        }
    };

    _callDeposit = async (asset, account, token, amount, referral, callback) => {
        const web3 = await this.getWeb3();
        const entryContractAddress = await this.getEntryContract(asset.index);
        if (!entryContractAddress) {
            callback("connector not create");
        } else {
            const yCurveFiContract = new web3.eth.Contract(
                asset.entryContractABI,
                entryContractAddress
            );

            let amountToSend = web3.utils.toWei(amount, "ether");
            if(token === asset.erc20Address){
                if (asset.erc20Decimals !== 18) {
                    amountToSend = (
                        amount * Number(`1e+${asset.erc20Decimals}`)
                    ).toFixed(0);
                }
            }else if(token === asset.erc20Address2){
                if (asset.erc20Decimals2 !== 18) {
                    amountToSend = (
                        amount * Number(`1e+${asset.erc20Decimals2}`)
                    ).toFixed(0);
                }
            }else{
                if (asset.decimals !== 18) {
                    amountToSend = (
                        amount * Number(`1e+${asset.decimals}`)
                    ).toFixed(0);
                }
            }
            let args;
            if (
                asset.type === "seed" ||
                (asset.type === "swap-native" && asset.erc20Address === token)
            ) {
                if(asset.referral && referral){
                    args = [0, vlxToEth(referral)];
                }else{
                    args = [0];
                } 
            } else {
                if(asset.referral && referral){
                    args = [token, amountToSend, 0, vlxToEth(referral)];
                }else{
                    args = [token, amountToSend, 0];
                } 
            }

            let gasLimit;
            try {
                gasLimit = await yCurveFiContract.methods.deposit(...args).estimateGas({
                    value:
                        asset.type === "seed" ||
                        (asset.type === "swap-native" &&
                            asset.erc20Address === token)
                            ? amountToSend
                            : "0",
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    )
                })    
            } catch (err) {
                gasLimit = "1000000";
            }
            
            yCurveFiContract.methods
                .deposit(...args)
                .send({
                    value:
                        asset.type === "seed" ||
                        (asset.type === "swap-native" &&
                            asset.erc20Address === token)
                            ? amountToSend
                            : "0",
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    ),
                    gasLimit
                })
                .on("transactionHash", function (hash) {
                    console.log(hash);

                    callback(null, hash);
                })
                .on("confirmation", function (confirmationNumber, receipt) {
                    if (confirmationNumber === 2) {
                        dispatcher.dispatch({
                            type: GET_BALANCES_PERPETUAL,
                            content: {}
                        });
                        emitter.emit(TX_CONFIRM);
                    }
                })
                .on("receipt", function (receipt) {
                    console.log(receipt);
                })
                .on("error", function (error) {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                })
                .catch(error => {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                });
        }
    };

    withdraw = payload => {
        const account = store.getStore("account");
        const {asset, token, amount} = payload.content;
        this._callWithdraw(asset, account, token, amount, (err, res) => {
            if (err) {
                return emitter.emit(ERROR, err);
            }

            return emitter.emit(WITHDRAW_RETURNED, res);
        });
    };

    _callWithdraw = async (asset, account, token, amount, callback) => {
        const web3 = await this.getWeb3();
        const entryContractAddress = await this.getEntryContract(asset.index);
        if (!entryContractAddress) {
            callback("connector not create");
        } else {
            const yCurveFiContract = new web3.eth.Contract(
                asset.entryContractABI,
                entryContractAddress
            );

            let amountToSend = web3.utils.toWei(amount, "ether");
            if (asset.decimals !== 18) {
                amountToSend = (
                    amount * Number(`1e+${asset.decimals}`)
                ).toFixed(0);
            }

            let args;
            if (
                asset.type === "seed" ||
                (asset.type === "swap-native" && asset.erc20Address === token)
            ) {
                args = [amountToSend, 0];
            } else {
                args = [token, amountToSend, 0];
            }

            let gasLimit;
            try {
                gasLimit = await yCurveFiContract.methods.withdraw(...args).estimateGas({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    )
                })
            } catch (err) {
                gasLimit = "1000000";
            }

            yCurveFiContract.methods
                .withdraw(...args)
                .send({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    ),
                    gasLimit
                })
                .on("transactionHash", function (hash) {
                    console.log(hash);

                    callback(null, hash);
                })
                .on("confirmation", function (confirmationNumber, receipt) {
                    if (confirmationNumber === 2) {
                        dispatcher.dispatch({
                            type: GET_BALANCES_PERPETUAL,
                            content: {}
                        });
                        emitter.emit(TX_CONFIRM);
                    }
                })
                .on("receipt", function (receipt) {
                    console.log(receipt);
                })
                .on("error", function (error) {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                })
                .catch(error => {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                });
        }
    };

    trade = payload => {
        const account = store.getStore("account");
        const {asset, token, token2, price, amount} = payload.content;
        this._checkApproval(
            token,
            asset.erc20ABI,
            account,
            amount,
            asset.address,
            err => {
                if (err) {
                    return emitter.emit(ERROR, err);
                }
                this._callTrade(
                    asset,
                    account,
                    token,
                    token2,
                    amount,
                    price,
                    (err, res) => {
                        if (err) {
                            return emitter.emit(ERROR, err);
                        }

                        return emitter.emit(TRADE_RETURNED, res);
                    }
                );
            }
        );
    };

    _callTrade = async (
        asset,
        account,
        token,
        token2,
        amount,
        price,
        callback
    ) => {
        price = parseFloat(price).toFixed(12);
        
        const web3 = await this.getWeb3();
        const yCurveFiContract = new web3.eth.Contract(
            asset.abi,
            asset.address
        ); 

        let amountToSend = web3.utils.toWei(amount, "ether");
        if(token === asset.erc20Address){
            if (asset.erc20Decimals !== 18) {
                amountToSend = (
                    amount * Number(`1e+${asset.erc20Decimals}`)
                ).toFixed(0);
            }
        }else if(token === asset.erc20Address2){
            if (asset.erc20Decimals2 !== 18) {
                amountToSend = (
                    amount * Number(`1e+${asset.erc20Decimals2}`)
                ).toFixed(0);
            }
        }else{
            if (asset.decimals !== 18) {
                amountToSend = (
                    amount * Number(`1e+${asset.decimals}`)
                ).toFixed(0);
            }
        }

        let gasLimit;
        if (asset.type === "swap-native" && asset.erc20Address === token) {
            try {
                gasLimit = await yCurveFiContract.methods.swapWTokenAmountIn(
                    token2,
                    "0",
                    web3.utils.toWei(price + "", "ether")
                ).estimateGas({
                    value: amountToSend,
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    )
                })
            } catch (err) {
                gasLimit = "1000000";
            }

            yCurveFiContract.methods
                .swapWTokenAmountIn(
                    token2,
                    "0",
                    web3.utils.toWei(price + "", "ether")
                )
                .send({
                    value: amountToSend,
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    ),
                    gasLimit
                })
                .on("transactionHash", function (hash) {
                    console.log(hash);

                    callback(null, hash);
                })
                .on("confirmation", function (confirmationNumber, receipt) {
                    if (confirmationNumber === 2) {
                        dispatcher.dispatch({
                            type: GET_BALANCES_PERPETUAL,
                            content: {}
                        });
                        emitter.emit(TX_CONFIRM);
                    }
                })
                .on("receipt", function (receipt) {
                    console.log(receipt);
                })
                .on("error", function (error) {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                })
                .catch(error => {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                });
        } else if (
            asset.type === "swap-native" &&
            asset.erc20Address !== token
        ) {
            console.log(token,amountToSend,price)
            try {
                gasLimit = await yCurveFiContract.methods.swapExactAmountInWTokenOut(
                    token,
                    amountToSend,
                    "0",
                    web3.utils.toWei(price + "", "ether")
                ).estimateGas({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    )
                })
            } catch (err) {
                gasLimit = "1000000";
            }

            yCurveFiContract.methods
                .swapExactAmountInWTokenOut(
                    token,
                    amountToSend,
                    "0",
                    web3.utils.toWei(price + "", "ether")
                )
                .send({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    ),
                    gasLimit
                })
                .on("transactionHash", function (hash) {
                    console.log(hash);

                    callback(null, hash);
                })
                .on("confirmation", function (confirmationNumber, receipt) {
                    if (confirmationNumber === 2) {
                        dispatcher.dispatch({
                            type: GET_BALANCES_PERPETUAL,
                            content: {}
                        });
                        emitter.emit(TX_CONFIRM);
                    }
                })
                .on("receipt", function (receipt) {
                    console.log(receipt);
                })
                .on("error", function (error) {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                })
                .catch(error => {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                });
        } else {
            try {
                gasLimit = await yCurveFiContract.methods.swapExactAmountIn(
                    token,
                    amountToSend,
                    token2,
                    "0",
                    web3.utils.toWei(price + "", "ether")
                ).estimateGas({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    )
                })
            } catch (err) {
                gasLimit = "1000000";
            }

            yCurveFiContract.methods
                .swapExactAmountIn(
                    token,
                    amountToSend,
                    token2,
                    "0",
                    web3.utils.toWei(price + "", "ether")
                )
                .send({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    ),
                    gasLimit
                })
                .on("transactionHash", function (hash) {
                    console.log(hash);

                    callback(null, hash);
                })
                .on("confirmation", function (confirmationNumber, receipt) {
                    if (confirmationNumber === 2) {
                        dispatcher.dispatch({
                            type: GET_BALANCES_PERPETUAL,
                            content: {}
                        });
                        emitter.emit(TX_CONFIRM);
                    }
                })
                .on("receipt", function (receipt) {
                    console.log(receipt);
                })
                .on("error", function (error) {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                })
                .catch(error => {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                });
        }
    };

    createEntryContract = payload => {
        const account = store.getStore("account");
        const {asset} = payload.content;

        this._callCreateEntryContract(asset, account, (err, res) => {
            if (err) {
                return emitter.emit(ERROR, err);
            }

            return emitter.emit(CREATE_ENTRY_CONTRACT_RETURNED, res);
        });
    };

    _callCreateEntryContract = async (asset, account, callback) => {
        const web3 = await this.getWeb3();

        const yCurveFiContract = new web3.eth.Contract(
            config.connectorFactoryABI,
            config.connectorFactory
        );

        let gasLimit;
        try {
            gasLimit = await yCurveFiContract.methods.createConnector(asset.address, asset.index).estimateGas({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei")
            })
        } catch (err) {
            gasLimit = "1000000";
        }

        yCurveFiContract.methods
            .createConnector(asset.address, asset.index)
            .send({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei"),
                gasLimit
            })
            .on("transactionHash", function (hash) {
                console.log(hash);

                callback(null, hash);
            })
            .on("confirmation", function (confirmationNumber, receipt) {
                if (confirmationNumber === 2) {
                    dispatcher.dispatch({
                        type: GET_BALANCES_PERPETUAL,
                        content: {}
                    });
                    emitter.emit(TX_CONFIRM);
                }
            })
            .on("receipt", function (receipt) {
                console.log(receipt);
            })
            .on("error", function (error) {
                if (!error.toString().includes("-32601")) {
                    if (error.message) {
                        return callback(error.message);
                    }
                    callback(error);
                }
            })
            .catch(error => {
                if (!error.toString().includes("-32601")) {
                    if (error.message) {
                        return callback(error.message);
                    }
                    callback(error);
                }
            });
    };

    getReward = payload => {
        const account = store.getStore("account");
        const {asset} = payload.content;

        this._callGetReward(asset, account, (err, res) => {
            if (err) {
                return emitter.emit(ERROR, err);
            }

            return emitter.emit(GET_REWARDS_RETURNED, res);
        });
    };

    _callGetReward = async (asset, account, callback) => {
        const web3 = await this.getWeb3();
        const entryContractAddress = await this.getEntryContract(asset.index);
        if (!entryContractAddress) {
            callback("connector not create");
        } else {
            const yCurveFiContract = new web3.eth.Contract(
                asset.entryContractABI,
                entryContractAddress
            );

            let gasLimit;
            try {
                gasLimit = await yCurveFiContract.methods.getReward().estimateGas({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    )
                })
            } catch (err) {
                gasLimit = "1000000";
            }

            yCurveFiContract.methods
                .getReward()
                .send({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    ),
                    gasLimit
                })
                .on("transactionHash", function (hash) {
                    console.log(hash);
                    callback(null, hash);
                })
                .on("confirmation", function (confirmationNumber, receipt) {
                    if (confirmationNumber === 2) {
                        dispatcher.dispatch({
                            type: GET_BALANCES_PERPETUAL,
                            content: {}
                        });
                        emitter.emit(TX_CONFIRM);
                    }
                })
                .on("receipt", function (receipt) {
                    console.log(receipt);
                })
                .on("error", function (error) {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                })
                .catch(error => {
                    if (!error.toString().includes("-32601")) {
                        if (error.message) {
                            return callback(error.message);
                        }
                        callback(error);
                    }
                });
        }
    };

    _getGasPrice = async () => {
        const networkId = store.getStore("networkId");
        if (networkId === "1") {
            try {
                const url = "https://gasprice.poa.network/";
                const priceString = await rp(url);
                const priceJSON = JSON.parse(priceString);
                if (priceJSON) {
                    return priceJSON.fast.toFixed(0);
                }
            } catch (e) {
                console.log(e);
                return store.getStore("universalGasPrice");
            }
        } else if (networkId === config.requiredNetworkId) {
            return store.getStore("universalGasPrice");
        } else {
            return "1";
        }
    };
}

let store = new Store();

export default {
    store: store,
    dispatcher: dispatcher,
    emitter: emitter
};
