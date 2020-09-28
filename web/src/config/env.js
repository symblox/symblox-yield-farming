import abis from "./abis";

function env() {
    return {
        requiredNetworkId: 111,
        minReservedAmount: 0.1, //18 wei，The minimum reserved amount of native tokens, so as not to pay the handling fee
        rpcUrl: "https://tn.yopta.net",
        bpt: "0xeA4bF1A4b8e687E1Aa23620A9ECF157b681B91Ec",
        syx: "0xC20932B245840CA1C6F8c9c90BDb2F4E0289DE48",
        wvlx: "0x78f18612775a2c54efc74c2911542aa034fe8d3f",
        rewardPool: "0x8b2B0CE402b33b5A2744371311E3053EAB2E2f3d",
        connectorFactory: "0x5F2F0e8Ae625A105755D699180f2029418401069",
        wvlxConnector: "0xADcEC6E88E4f96C920F0F9B4199a51Df9FBcea36",
        bptConnector: "0x9dBbAF59d89eA38aB2A57842B7947562a8CF6a69",
        erc20ABI: abis.erc20ABI,
        rewardPoolABI: abis.rewardPoolABI,
        bptABI: abis.bptABI,
        syxABI: abis.syxABI,
        bptConnectorABI: abis.bptConnectorABI,
        wvlxConnectorABI: abis.wvlxConnectorABI,
        connectorFactoryABI: abis.connectorFactoryABI,
        secPerBlock: 5
    };
    // if (process.env.NODE_ENV === "development") {

    // } else if (process.env.NODE_ENV === "production") {

    // }
}
export default env();
