import config from "../config";
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

import {injected} from "./connectors";

const rp = require("request-promise");

const Dispatcher = require("flux").Dispatcher;
const Emitter = require("events").EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

const blocksPerYear = 2102400;
class Store {
    constructor() {
        this.store = {
            currentBlock: 0,
            universalGasPrice: "20",
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
            rewardPools: [
                {
                    id: "VLX",
                    featured: true,
                    name: "VLX",
                    website: "Reward Pool",
                    index: 0,
                    address: config.wvlx,
                    symbol: "VLX",
                    ROI: "DF",
                    type: "seed",
                    tokens: ["VLX"],
                    totalSupply: 0,
                    abi: config.erc20ABI,
                    erc20ABI: config.erc20ABI,
                    decimals: 18,
                    erc20Balance: 0,
                    entryContractABI: config.wvlxConnectorABI,
                    entryContractFactoryAddress: config.connectorFactory,
                    entryContractFactoryABI: config.connectorFactoryABI,
                    weight: "",
                    rewardsAddress: config.syx,
                    rewardsABI: config.syxABI,
                    rewardsSymbol: "SYX",
                    rewardsDecimal: 0,
                    rewardsBalance: 0,
                    poolAddress: config.rewardPool,
                    poolABI: config.rewardPoolABI,
                    rewardsAvailable: 0
                },
                {
                    id: "SYX/VLX",
                    featured: false,
                    name: "VLX",
                    website: "Reward Pool",
                    index: 1,
                    address: config.bpt,
                    symbol: "BPT",
                    ROI: "DF",
                    type: "swap-native",
                    tokens: ["SYX", "VLX"], //reward token must in first
                    totalSupply: 0,
                    abi: config.bptABI,
                    decimals: 18,
                    erc20Address: config.wvlx,
                    erc20ABI: config.erc20ABI,
                    erc20Balance: 0,
                    entryContractABI: config.bptConnectorABI,
                    entryContractFactoryAddress: config.connectorFactory,
                    entryContractFactoryABI: config.bptConnectorABI,
                    weight: "",
                    rewardsAddress: config.syx,
                    rewardsABI: config.syxABI,
                    rewardsSymbol: "SYX",
                    rewardsDecimal: 0,
                    rewardsBalance: 0,
                    poolAddress: config.rewardPool,
                    poolABI: config.rewardPoolABI,
                    rewardsAvailable: 0
                }
            ]
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
        const web3 = new Web3(store.getStore("web3context").library.provider);
        const currentBlock = await web3.eth.getBlockNumber();

        store.setStore({currentBlock: currentBlock});

        window.setTimeout(() => {
            emitter.emit(CONFIGURE_RETURNED);
        }, 100);
    };

    getWeb3 = async () => {
        let web3;
        if (
            store.getStore("web3context") &&
            store.getStore("web3context").library.provider
        ) {
            web3 = new Web3(store.getStore("web3context").library.provider);
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
        const keyName = "entryContractAddress" + id;

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
                store.setStore({keyName: connectorAddress});
            } catch (err) {
                console.error(err);
            }
        }
        // console.log("pool: ", id, " connectorAddress: ", connectorAddress);
        return connectorAddress;
    };

    getBalancesPerpetual = async () => {
        const pools = store.getStore("rewardPools");
        const account = store.getStore("account");
        const web3 = await this.getWeb3();

        try {
            const currentBlock = await web3.eth.getBlockNumber();
            store.setStore({currentBlock: currentBlock});
        } catch (err) {
            console.log(err);
            return emitter.emit(ERROR, err);
        }

        async.map(
            pools,
            (pool, callback) => {
                async.parallel(
                    [
                        //0
                        callbackInner => {
                            this._getEntryContract(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //1
                        callbackInner => {
                            this._getStakeAmount(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //2
                        callbackInner => {
                            this._getRewardsAvailable(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //3
                        callbackInner => {
                            this._getERC20TokenPrice(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //4
                        callbackInner => {
                            this._getERC20Balance(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //5
                        callbackInner => {
                            this._getRewardTokenBalance(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //6
                        callbackInner => {
                            this._getRewardRate(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //7
                        callbackInner => {
                            this._getAllocPoint(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //8
                        callbackInner => {
                            this._getStakeTokenPrice(
                                web3,
                                pool,
                                pool.erc20Address,
                                "1",
                                callbackInner
                            );
                        },
                        //9
                        callbackInner => {
                            this._getStakeTokenTotalSupply(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //10
                        callbackInner => {
                            this._getWeight(web3, pool, account, callbackInner);
                        },
                        //11
                        callbackInner => {
                            this._getBptTotalBalance(
                                web3,
                                pool,
                                pool.erc20Address,
                                account,
                                callbackInner
                            );
                        },
                        //12
                        callbackInner => {
                            this._getBptTotalBalance(
                                web3,
                                pool,
                                pool.rewardsAddress,
                                account,
                                callbackInner
                            );
                        },
                        //13
                        callbackInner => {
                            this._getBptMaxInRatio(
                                web3,
                                pool,
                                account,
                                callbackInner
                            );
                        },
                        //14
                        callbackInner => {
                            this._getBptMaxOutRatio(
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
                            return callback(err);
                        }
                        pool.entryContractAddress = data[0];
                        pool.stakeAmount = data[1];
                        pool.rewardsAvailable = data[2];
                        pool.price = data[3];
                        pool.erc20Balance = data[4];
                        pool.rewardsBalance = data[5];
                        pool.rewardRate = data[6] * data[7];
                        pool.allocPoint = data[7];
                        pool.BPTPrice = data[8];
                        pool.totalSupply = data[9];
                        pool.totalBalanceForSyx = 0;
                        if (pool.type === "seed") {
                            pool.totalBalanceForSyx =
                                parseFloat(pool.totalSupply) /
                                parseFloat(pool.price);
                        } else {
                            pool.totalBalanceForSyx =
                                parseFloat(data[11]) / parseFloat(pool.price) +
                                parseFloat(data[12]);
                        }

                        pool.rewardApr = (pool.totalBalanceForSyx > 0
                            ? ((parseFloat(pool.rewardRate) * blocksPerYear) /
                                  pool.totalBalanceForSyx) *
                              100
                            : 0
                        ).toFixed(1);

                        pool.weight = data[10];

                        pool.bptVlxBalance = data[11];
                        pool.bptSyxBalance = data[12];

                        pool.maxErc20In =
                            parseFloat(data[13]) * parseFloat(data[11]);
                        pool.maxSyxIn =
                            parseFloat(data[13]) * parseFloat(data[12]);
                        pool.maxErc20Out =
                            parseFloat(data[14]) * parseFloat(data[11]);
                        pool.maxSyxOut =
                            parseFloat(data[14]) * parseFloat(data[12]);
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
                                    poolData[j] &&
                                    poolData[j].type !== "seed" &&
                                    poolData[i].name === poolData[j].name
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
                    }
                }
                if (err) {
                    console.log(err);
                    return emitter.emit(ERROR, err);
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

    _getEntryContract = async (web3, asset, account, callback) => {
        const entryContractAddress = await this.getEntryContract(asset.index);

        if (!entryContractAddress) {
            callback(null, null);
        } else {
            callback(null, entryContractAddress);
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

    _getERC20Balance = async (web3, asset, account, callback) => {
        if (!account || !account.address) return callback(null, "0");
        if (asset.type === "seed" || asset.type === "swap-native") {
            try {
                let balance = await web3.eth.getBalance(account.address);
                callback(null, toStringDecimals(balance, asset.decimals));
            } catch (ex) {
                return callback(ex);
            }
        } else {
            let erc20Contract = new web3.eth.Contract(
                asset.erc20ABI,
                asset.erc20Address
            );
            try {
                let balance = await erc20Contract.methods
                    .balanceOf(account.address)
                    .call();
                callback(null, toStringDecimals(balance, asset.decimals));
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    _getRewardTokenBalance = async (web3, asset, account, callback) => {
        if (!account || !account.address) return callback(null, "0");
        let erc20Contract = new web3.eth.Contract(
            asset.erc20ABI,
            asset.rewardsAddress
        );
        try {
            let balance = await erc20Contract.methods
                .balanceOf(account.address)
                .call();
            callback(null, toStringDecimals(balance, asset.decimals));
        } catch (ex) {
            return callback(ex);
        }
    };

    _getRewardRate = async (web3, asset, account, callback) => {
        let erc20Contract = new web3.eth.Contract(
            asset.poolABI,
            asset.poolAddress
        );
        try {
            let rate = await erc20Contract.methods.syxPerBlock().call();

            callback(null, toStringDecimals(rate, 18));
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
            let totalAllocPoint = await erc20Contract.methods
                .totalAllocPoint()
                .call();
            let poolInfo = await erc20Contract.methods
                .poolInfo(asset.index)
                .call();

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
            const balanceIn = await bptContract.methods
                .getBalance(tokenIn)
                .call({from: account.address});
            const denormIn = await bptContract.methods
                .getDenormalizedWeight(tokenIn)
                .call({from: account.address});
            const balanceOut = await bptContract.methods
                .getBalance(tokenOut)
                .call({from: account.address});
            const denormOut = await bptContract.methods
                .getDenormalizedWeight(tokenOut)
                .call({from: account.address});

            const swapFee = await bptContract.methods
                .getSwapFee()
                .call({from: account.address});

            if (type === "sell") {
                let tokenAmountOut = await bptContract.methods
                    .calcOutGivenIn(
                        balanceIn,
                        denormIn,
                        balanceOut,
                        denormOut,
                        web3.utils.toWei(amount + "", "ether"),
                        swapFee
                    )
                    .call({from: account.address});

                //Trading price
                let tradePrice =
                    web3.utils.fromWei(tokenAmountOut + "", "ether") / amount;

                //Post-trade price
                let finallPrice = await bptContract.methods
                    .calcSpotPrice(
                        web3.utils.toWei(
                            parseFloat(web3.utils.fromWei(balanceIn, "ether")) +
                                amount +
                                "",
                            "ether"
                        ),
                        denormIn,
                        web3.utils.toWei(
                            parseFloat(
                                web3.utils.fromWei(balanceOut, "ether")
                            ) -
                                parseFloat(
                                    web3.utils.fromWei(tokenAmountOut, "ether")
                                ) +
                                "",
                            "ether"
                        ),
                        denormOut,
                        swapFee
                    )
                    .call({from: account.address});
                finallPrice = toStringDecimals(finallPrice, asset.decimals);

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
                let tokenAmountIn = await bptContract.methods
                    .calcInGivenOut(
                        balanceIn,
                        denormIn,
                        balanceOut,
                        denormOut,
                        web3.utils.toWei(amount + "", "ether"),
                        swapFee
                    )
                    .call({from: account.address});

                //Trading price
                let tradePrice =
                    amount / web3.utils.fromWei(tokenAmountIn + "", "ether");

                //Post-trade price
                let finallPrice = await bptContract.methods.calcSpotPrice(
                        web3.utils.toWei(
                            parseFloat(web3.utils.fromWei(balanceIn, "ether")) +
                                parseFloat(
                                    web3.utils.fromWei(tokenAmountIn, "ether")
                                ) +
                                "",
                            "ether"
                        ),
                        denormIn,
                        web3.utils.toWei(
                            parseFloat(
                                web3.utils.fromWei(balanceOut, "ether")
                            ) -
                                amount +
                                "",
                            "ether"
                        ),
                        denormOut,
                        swapFee
                    )
                    .call({from: account.address});

                finallPrice = toStringDecimals(finallPrice, asset.decimals);

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
                const balance = await bptContract.methods
                    .getBalance(token)
                    .call();
                const denorm = await bptContract.methods
                    .getDenormalizedWeight(token)
                    .call();
                const totalSupply = await bptContract.methods
                    .totalSupply()
                    .call();
                const totalWeight = await bptContract.methods
                    .getTotalDenormalizedWeight()
                    .call();
                const swapFee = await bptContract.methods.getSwapFee().call();

                let amountOut = await bptContract.methods
                    .calcPoolInGivenSingleOut(
                        balance,
                        denorm,
                        totalSupply,
                        totalWeight,
                        web3.utils.toWei(amount + "", "ether"),
                        swapFee
                    )
                    .call();
                callback(
                    null,
                    toStringDecimals(amountOut, asset.decimals)
                );
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    getStakeTokenPrice = async payload => {
        const web3 = await this.getWeb3();
        const {asset, amount, token} = payload.content;
        this._getStakeTokenPrice(web3, asset, token, amount, (err, res) => {
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
        amount = "1",
        callback
    ) => {
        if (asset.type === "seed") {
            //The token deposited in the seed pool is the token pledged to the reward pool, so the price is 1
            callback(null, "1");
        } else {
            let bptContract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                const balance = await bptContract.methods
                    .getBalance(token)
                    .call();
                const denorm = await bptContract.methods
                    .getDenormalizedWeight(token)
                    .call();
                const totalSupply = await bptContract.methods
                    .totalSupply()
                    .call();
                const totalWeight = await bptContract.methods
                    .getTotalDenormalizedWeight()
                    .call();
                const swapFee = await bptContract.methods.getSwapFee().call();

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
                callback(
                    null,
                    toStringDecimals(amountOut, asset.decimals)
                );
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    _getStakeTokenTotalSupply = async (web3, asset, account, callback) => {
        let contract = new web3.eth.Contract(asset.abi, asset.address);
        try {
            let totalSupply;
            totalSupply = await contract.methods
                .balanceOf(asset.poolAddress)
                .call();
            callback(null, toStringDecimals(totalSupply, asset.decimals));
        } catch (ex) {
            return callback(ex);
        }
    };

    _getWeight = async (web3, asset, account, callback) => {
        if (asset.type === "seed") {
            callback(null, "0");
        } else {
            let bptContract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                const weight1 = await bptContract.methods
                    .getDenormalizedWeight(asset.rewardsAddress)
                    .call();
                const weight2 = await bptContract.methods
                    .getDenormalizedWeight(asset.erc20Address)
                    .call();
                callback(
                    null,
                    parseInt(toStringDecimals(weight1, asset.decimals)) +
                        ":" +
                        parseInt(toStringDecimals(weight2, asset.decimals))
                );
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    // _getPeriodFinish = async (web3, asset, account, callback) => {
    //     let contract = new web3.eth.Contract(asset.poolABI, asset.poolAddress);
    //     try {
    //         const curBlockNumber = await web3.eth.getBlockNumber();
    //         const res = await contract.methods.bonusEndBlock().call();
    //         const diff = res - curBlockNumber;
    //         if (diff > 0) {
    //             callback(null, moment().unix() + diff * config.secPerBlock);
    //         } else {
    //             const pastBlock = await web3.eth.getBlock(res);
    //             callback(null, pastBlock.timestamp);
    //         }
    //     } catch (ex) {
    //         return callback(ex);
    //     }
    // };

    _getBptTotalBalance = async (web3, asset, token, account, callback) => {
        if (asset.type === "seed") {
            callback(null, "0");
        } else {
            let bptContract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                let amount = await bptContract.methods.getBalance(token).call();
                callback(null, toStringDecimals(amount, asset.decimals));
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    _getBptMaxInRatio = async (web3, asset, account, callback) => {
        if (asset.type === "seed") {
            callback(null, "0");
        } else {
            let bptContract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                let ratio = await bptContract.methods.MAX_IN_RATIO().call();
                callback(null, toStringDecimals(ratio, asset.decimals));
            } catch (ex) {
                return callback(ex);
            }
        }
    };

    _getBptMaxOutRatio = async (web3, asset, account, callback) => {
        if (asset.type === "seed") {
            callback(null, "0");
        } else {
            let bptContract = new web3.eth.Contract(asset.abi, asset.address);
            try {
                let ratio = await bptContract.methods.MAX_OUT_RATIO().call();
                callback(null, toStringDecimals(ratio, asset.decimals));
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
                let price = await contract.methods
                    .getSpotPrice(asset.erc20Address, asset.rewardsAddress)
                    .call();
                callback(null, toStringDecimals(price, asset.decimals));
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
        const {asset, token, amount} = payload.content;
        const entryContractAddress = await this.getEntryContract(asset.index);
        if (!entryContractAddress)
            return emitter.emit(ERROR, "connector not create");
        if (
            asset.type === "seed" ||
            (asset.type === "swap-native" && asset.erc20Address === token)
        ) {
            this._callDeposit(asset, account, token, amount, (err, res) => {
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

    _callDeposit = async (asset, account, token, amount, callback) => {
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
                args = [0];
            } else {
                args = [token, amountToSend, 0];
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
                    )
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

            yCurveFiContract.methods
                .withdraw(...args)
                .send({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    )
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

        var amountToSend = web3.utils.toWei(amount, "ether");
        if (asset.decimals !== 18) {
            amountToSend = (amount * Number(`1e+${asset.decimals}`)).toFixed(0);
        }

        if (asset.type === "swap-native" && asset.erc20Address === token) {
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
                    )
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
                    )
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
                    )
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

        yCurveFiContract.methods
            .createConnector(asset.address, asset.index)
            .send({
                from: account.address,
                gasPrice: web3.utils.toWei(await this._getGasPrice(), "gwei")
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

            yCurveFiContract.methods
                .getReward()
                .send({
                    from: account.address,
                    gasPrice: web3.utils.toWei(
                        await this._getGasPrice(),
                        "gwei"
                    )
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

var store = new Store();

export default {
    store: store,
    dispatcher: dispatcher,
    emitter: emitter
};
