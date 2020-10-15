import abis from "./abis";

let requiredNetworkId = 106;

if (process.env.NODE_ENV === "development") {
    requiredNetworkId = 111;
} else if (process.env.NODE_ENV === "production") {
    requiredNetworkId = 106;
}
console.log(process.env.NODE_ENV);
const rpcUrls = {
    111: "https://tn.yopta.net",
    106: "https://explorer.velas.com/rpc"
};

function env() {
    if (process.env.NODE_ENV === "development") {
        return {
            requiredNetworkId,
            rpcUrl: rpcUrls[requiredNetworkId],
            minReservedAmount: 0.1, //18 wei，The minimum reserved amount of native tokens, so as not to pay the handling fee
            bpt: "0xeA4bF1A4b8e687E1Aa23620A9ECF157b681B91Ec",
            syx: "0xC20932B245840CA1C6F8c9c90BDb2F4E0289DE48",
            wvlx: "0x78f18612775a2c54efc74c2911542aa034fe8d3f",
            rewardPool: "0x8b2B0CE402b33b5A2744371311E3053EAB2E2f3d",
            connectorFactory: "0xE1532372F4592E4B6D4fB666F5F2027847a81A8A",
            wvlxConnector: "0xf56DE4B7D4A5e399edaA10DbF3e041793Bce4141",
            bptConnector: "0x3aa6730C8F773c5920501e6782E83181d0370dCA",
            erc20ABI: abis.erc20ABI,
            rewardPoolABI: abis.rewardPoolABI,
            bptABI: abis.bptABI,
            syxABI: abis.syxABI,
            bptConnectorABI: abis.bptConnectorABI,
            wvlxConnectorABI: abis.wvlxConnectorABI,
            connectorFactoryABI: abis.connectorFactoryABI,
            secPerBlock: 5
        };
    } else if (process.env.NODE_ENV === "production") {
        return {
            requiredNetworkId,
            rpcUrl: rpcUrls[requiredNetworkId],
            minReservedAmount: 0.1, //18 wei，The minimum reserved amount of native tokens, so as not to pay the handling fee
            bpt: "",
            syx: "0x2de7063fe77aAFB5b401d65E5A108649Ec577170",
            wvlx: "0x2b1aBEb48f875465bf0D3A262a2080ab1C7A3E39",
            rewardPool: "0x76068bdd1D211A081FBaF3D5513B5e59a7fA3F7b",
            connectorFactory: "0xE5E29A8aEfa67DAd8A78D44FB5d73807093870e2",
            wvlxConnector: "0xf6182f2924065343947E7F12ec4a989Fd9D2A9Ec",
            bptConnector: "",
            erc20ABI: abis.erc20ABI,
            rewardPoolABI: abis.rewardPoolABI,
            bptABI: abis.bptABI,
            syxABI: abis.syxABI,
            bptConnectorABI: abis.bptConnectorABI,
            wvlxConnectorABI: abis.wvlxConnectorABI,
            connectorFactoryABI: abis.connectorFactoryABI,
            secPerBlock: 5
        };
    }
}
export default env();
