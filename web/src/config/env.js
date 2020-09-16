import abis from "./abis";

function env() {
    return {
        bpt: "0x7e2BCdB60c49cC6c65664D18b555D1d796BeD323",
        syx: "0xc25deE29c896CCF9CE4E2DB88995Ce4181d44981",
        wvlx: "0x78f18612775a2c54efc74c2911542aa034fe8d3f",
        rewardPool: "0x0C02A2b0e291334aD348c4eF61BB5d0e444ea53B",
        connectorFactory: "0xcfFdD3919C3f0b783BE706d196895F22A573E6cd",
        wvlxConnector: "0xCe8521591651ac54e8002fb6843C126c45812aA0",
        bptConnector: "0xe38D0284c88618a2F59aaf4D33F1f023374c487F",
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
