const ERC20 = artifacts.require("MockERC20");
const RewardManager = artifacts.require("RewardManager");
const Symblox = artifacts.require("SymbloxToken");
const ConnectorFactory = artifacts.require("ConnectorFactory");
const WvlxConnector = artifacts.require("WvlxConnector");

module.exports = async function (deployer, network, accounts) {
    const ADMIN = accounts[0];

    const supportedTokens = [
        {
            name: "Wrapped Velas",
            symbol: "WVLX",
            decimals: 18,
            initSupply: "10000000000000000000000000" // only for development network
        }
        // {
        //     name: "Wrapped Ether",
        //     symbol: "WETH",
        //     decimals: 18,
        //     initSupply: "0" // only for development network
        // },
        // {
        //     name: "Wrapped Bitcoin",
        //     symbol: "WBTC",
        //     decimals: 8,
        //     initSupply: "0" // only for development network
        // }
    ];

    const contractAddresses = {
        kovan: {
            BFactory: "0xa5e096c080773b39b5e61c1735508632a62eede4",
            WVLX: "0xdcf23ab3850ba55ed26c18930058e0372da5c50a"
        },
        vlxtest: {
            BFactory: "0xC825DC4ea4c91E779545c0EB761C1c0cBcaA4195",
            WVLX: "0x78f18612775a2c54efc74c2911542aa034fe8d3f"
        }
    };

    let tokenContracts = {};

    if (network == "development" || network == "coverage") {
        // create test ERC20 tokens

        for (let token of supportedTokens) {
            await deployer.deploy(
                ERC20,
                token.name,
                token.symbol,
                token.decimals,
                token.initSupply
            );
            tokenInstance = await ERC20.deployed();
            console.log(
                `Deployed token ${token.symbol} at ${tokenInstance.address}`
            );
            tokenContracts[token.symbol] = tokenInstance;
            await tokenInstance.mint(ADMIN, "100000000000000000000000"); //10000
        }
    }

    const rewardMgr = await RewardManager.deployed();
    console.log(`RewardManager: ${rewardMgr.address}`);

    const syx = await Symblox.deployed();
    console.log(`Symblox: ${syx.address}`);

    const connFactory = await deployer.deploy(
        ConnectorFactory,
        rewardMgr.address
    );
    console.log(`ConnectorFactory: ${connFactory.address}`);

    let wvlxAddress;

    if (network == "development" || network == "coverage") {
        wvlxAddress = tokenContracts["WVLX"].address;
    } else {
        wvlxAddress = contractAddresses[network]["WVLX"];
    }

    //
    // Setup the seeding pool
    //

    // create a new pool with pid: 0
    await rewardMgr.add(
        "100000000000000000", // weight, 0.1
        wvlxAddress,
        false // whether to update all the pools
    );

    const wvlxPoolId = 0;

    const wvlxConn = await deployer.deploy(WvlxConnector);

    await connFactory.setConnectorImpl(wvlxPoolId, wvlxConn.address);

    if (network == "development" || network == "coverage") {
        const createConnTx = await connFactory.createConnector(
            wvlxAddress,
            wvlxPoolId
        );
        const logs = createConnTx.logs;
        for (let log of logs) {
            // console.log({log});
        }
    }

    const numOfPools = await rewardMgr.poolLength();
    console.log(`Pools created: ${numOfPools}`);
};
