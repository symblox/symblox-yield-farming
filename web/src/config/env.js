import abis from "./abis";

let requiredNetworkId = process.env.REACT_APP_ENV === "production" ? 106 : 111;

const rpcUrls = {
    111: "https://explorer.testnet.veladev.net/rpc",
    106: "https://rpc.symblox.net:8080/"
};

const browserUrls = {
    111: "https://explorer.testnet.veladev.net",
    106: "https://explorer.velas.com"
};

console.log("REACT_APP_ENV: ", process.env.REACT_APP_ENV);

function env() {
    if (process.env.REACT_APP_ENV === "production") {
        return {
            // requiredNetworkId,
            // rpcUrl: rpcUrls[requiredNetworkId],
            // browser: browserUrls[requiredNetworkId],
            // minReservedAmount: 0.1, //18 wei，The minimum reserved amount of native tokens, so as not to pay the handling fee
            // bpt: "0x63a4cB3251CC3A93aF72C121d661C700637Fc7CB",
            // usdtBpt: "0x95853604e6dec040b45D4Ee13fDC8732492B3cBB",
            // vlxUsdtBpt: "0x2598cAa01C04b8eB7Ec4dC82AC0458593B823262",
            // usdt: "0x4b773e1ae1baa4894e51cc1d1faf485c91b1012f",
            // syx: "0x2de7063fe77aAFB5b401d65E5A108649Ec577170",
            // wvlx: "0x2b1aBEb48f875465bf0D3A262a2080ab1C7A3E39",
            // rewardPool: "0x76068bdd1D211A081FBaF3D5513B5e59a7fA3F7b",
            // connectorFactory: "0xE5E29A8aEfa67DAd8A78D44FB5d73807093870e2",
            // wvlxConnector: "0xf6182f2924065343947E7F12ec4a989Fd9D2A9Ec",
            // bptConnector: "0xbF3357651540a8259dbd4E35bb761D12c4592Ef5",
            // bptReferralConnector: "0x66Be02528e1dC95DF60B5B3C908FCF11Bf2b16AC",
            // timelock: "0x19eb08763450504b2bc07a773dff2ac49e4f3bde",
            // governor: "0xdEdBCBdEc215a32bB75acfc278F57dCEb2fb6da1",
            // devFund: "0x17d8A87BF9F3f8ca7469D576d958bE345c1D9D5D",
            // erc20ABI: abis.erc20ABI,
            // rewardPoolABI: abis.rewardPoolABI,
            // bptABI: abis.bptABI,
            // syxABI: abis.syxABI,
            // bptRefConnectorABI: abis.bptRefConnectorABI,
            // wvlxConnectorABI: abis.wvlxConnectorABI,
            // connectorFactoryABI: abis.connectorFactoryABI,
            // secPerBlock: 5
        };
    } else {
        return {
            requiredNetworkId,
            rpcUrl: rpcUrls[requiredNetworkId],
            browser: browserUrls[requiredNetworkId],
            minReservedAmount: 0.1, //18 wei，The minimum reserved amount of native tokens, so as not to pay the handling fee
            rewardPool: "0x2c140E4561ef42c20B60E600CA52B86147858AC5",
            connectorFactory: "0xDCc1FaFb0B2e87DDdF9B6F5E942956572a65266C", //no set governor
            bptConnector: "0x9a073bDa5C127f2E94106B9F29EB603B212656a9", //BptReferralConnector
            bptFactory: "0x01365EDf0079d31311e3cc732CD4D2083EE8e3c1",
            wvlx: "0x78f18612775a2c54efc74c2911542aa034fe8d3f",
            weth: "0x41e7fb07236a736e06b3460e458a5b827e552521",
            syx: "0x28a6312D786e9d7a78637dD137AbeF5332F3b2Aa",
            usdt: "0xA23bAeA56de679FD1baf200E92a75ac8d5eeBc8A",
            oldSyx: "0xC20932B245840CA1C6F8c9c90BDb2F4E0289DE48",
            vlxSyxBpt: "0x3FBaf23119a999336bb9bB0744bcC6f60540B4B4",
            vlxUsdtBpt: "0x4b067bc68b54133fe64832affbab3d7a6d361ba5",
            usdtSyxBpt: "0x53c74185bad56d362e0932fdfb4cea0bea5dccff",
            ethSyxBpt: "0xa64b215b3b532cf7c4d1e384eff15346f0f5681c", 
            vlxEthBpt: "0xCF433aBcB66E8085744Adc97D65E38BFd5Ebbc15",
            devFund: "0x17d8A87BF9F3f8ca7469D576d958bE345c1D9D5D",
            erc20ABI: abis.erc20ABI,
            rewardPoolABI: abis.rewardPoolABI,
            bptABI: abis.bptABI,
            syxABI: abis.syxABI,
            bptRefConnectorABI: abis.bptRefConnectorABI,
            wvlxConnectorABI: abis.wvlxConnectorABI,
            connectorFactoryABI: abis.connectorFactoryABI,
            secPerBlock: 5
        };
    }
}
export default env();
