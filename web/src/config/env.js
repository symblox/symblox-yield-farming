import abis from "./abis";

let requiredNetworkId = process.env.SERVER_ENV === "production" ? 106 : 111;

const rpcUrls = {
    111: "https://explorer.testnet.veladev.net/rpc",
    106: "https://explorer.velas.com/rpc"
};

const browserUrls = {
    111: "https://explorer.testnet.veladev.net",
    106: "https://explorer.velas.com"
};

console.log("NODE_ENV: ", process.env.SERVER_ENV);

function env() {
    if (process.env.SERVER_ENV === "production") {
        return {
            requiredNetworkId,
            rpcUrl: rpcUrls[requiredNetworkId],
            browser: browserUrls[requiredNetworkId],
            minReservedAmount: 0.1, //18 wei，The minimum reserved amount of native tokens, so as not to pay the handling fee
            bpt: "0x63a4cB3251CC3A93aF72C121d661C700637Fc7CB",
            syx: "0x2de7063fe77aAFB5b401d65E5A108649Ec577170",
            wvlx: "0x2b1aBEb48f875465bf0D3A262a2080ab1C7A3E39",
            rewardPool: "0x76068bdd1D211A081FBaF3D5513B5e59a7fA3F7b",
            connectorFactory: "0xE5E29A8aEfa67DAd8A78D44FB5d73807093870e2",
            wvlxConnector: "0xf6182f2924065343947E7F12ec4a989Fd9D2A9Ec",
            bptConnector: "0xbF3357651540a8259dbd4E35bb761D12c4592Ef5",
            timelock: "0x19eb08763450504b2bc07a773dff2ac49e4f3bde",
            governor: "0xdEdBCBdEc215a32bB75acfc278F57dCEb2fb6da1",
            devFund: "0x17d8A87BF9F3f8ca7469D576d958bE345c1D9D5D",
            erc20ABI: abis.erc20ABI,
            rewardPoolABI: abis.rewardPoolABI,
            bptABI: abis.bptABI,
            syxABI: abis.syxABI,
            bptConnectorABI: abis.bptConnectorABI,
            wvlxConnectorABI: abis.wvlxConnectorABI,
            connectorFactoryABI: abis.connectorFactoryABI,
            secPerBlock: 5
        };
    } else {
        return {
            requiredNetworkId,
            rpcUrl: rpcUrls[requiredNetworkId],
            browser: browserUrls[requiredNetworkId],
            minReservedAmount: 0.1, //18 wei，The minimum reserved amount of native tokens, so as not to pay the handling fee
            bpt: "0xeA4bF1A4b8e687E1Aa23620A9ECF157b681B91Ec",
            pVlxBpt: "0x8622C2315d4DDDff42C695D44f139032578b7A8a",
            usdtBpt: "0x2466290Cf22A134b72BC4Fb7fc3c07cD0300eEc5",
            syx: "0xC20932B245840CA1C6F8c9c90BDb2F4E0289DE48",
            wvlx: "0x78f18612775a2c54efc74c2911542aa034fe8d3f",
            usdt: "0xA23bAeA56de679FD1baf200E92a75ac8d5eeBc8A",
            pVlx: "0x3724d456d7D02327A06B6a12DB429D83A2617c9B",
            rewardPool: "0x8b2B0CE402b33b5A2744371311E3053EAB2E2f3d",
            //connectorFactory: "0xff165a0eeCc3CcB0057e7a8cf7E83Af4ea4d253a",
            connectorFactory: "0x7A4c56107Ec4ac3380F96BC308184860808e6004", //no set governor
            wvlxConnector: "0xf56DE4B7D4A5e399edaA10DbF3e041793Bce4141",
            //bptConnector: "0x3aa6730C8F773c5920501e6782E83181d0370dCA",
            bptConnector: "0xa4bE2f7521B95CEAD57EdbC3af140AC7e942bf74", //BptReferralConnector
            timelock: "0x779af23521336FE29Ecfc2417693c819dEAFBF8F",
            governor: "0xbA0213618B25e4A365Abb0cbf6E849Eab312cA79",
            devFund: "0x17d8A87BF9F3f8ca7469D576d958bE345c1D9D5D",
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
