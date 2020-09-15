import abis from "./abis";

function env() {
    return {
        bpt: "0x2ad4BedDB6Afa3C12160FE2606464ef4b8436b33",
        syx: "0x4251d3FEB080eF35479eF1253F24b23906F61B1F",
        wvlx: "0x78f18612775a2c54efc74c2911542aa034fe8d3f",
        rewardPool: "0x4695561d2D0512813cFc539dc5cC4059DF609C39",
        connectorFactory: "0xC16dfA7E2585C05B51684877956afb42e0798EEC",
        wvlxConnector: "0x8EdaBcef0b259812C3D699Bd3010847a6CE4F0Ef",
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
