const TruffleConfig = require("@truffle/config");
const ConnectorFactory = artifacts.require("ConnectorFactory");
const BptReferralConnector = artifacts.require("BptReferralConnector");

const contractSettings = {
    connectorFactory: {
        vlxtest: {
            rewardManager: "0x5EddDA6482029E466F296AeD75cFcc624245bB80",
            wvlx: "0x78f18612775a2c54efc74c2911542aa034fe8d3f"
        },
        vlxmain: {
            rewardManager: "0x44DDf8BDcF16667f0E9F452D3E3733Dddf438da0",
            wvlx: "0x2b1aBEb48f875465bf0D3A262a2080ab1C7A3E39"
        },
        bsctest: {},
        bscmain: {}
    }
};

async function main() {
    const networkName = process.argv[process.argv.length - 1];
    let truffleConfig = TruffleConfig.detect({network: networkName});
    const network = truffleConfig.networks[networkName]
        ? networkName
        : "development";
    if (!truffleConfig.networks[networkName]) {
        truffleConfig = TruffleConfig.detect({network});
    }
    console.log(`Running script with the ${network} network...`);

    const connectorFactoryContract = await ConnectorFactory.new(
        contractSettings["connectorFactory"][network]["rewardManager"],
        contractSettings["connectorFactory"][network]["wvlx"]
    );
    console.log(
        `connectorFactory address is ${connectorFactoryContract.address}`
    );

    const bptReferralConnectorContract = await BptReferralConnector.new();
    console.log(
        `bptReferralConnector address is ${bptReferralConnectorContract.address}`
    );
}

// Required by `truffle exec`.
module.exports = function (done) {
    return new Promise((resolve, reject) => {
        main()
            .then(value => {
                resolve(value);
                done();
            })
            .catch(err => {
                console.log(`Error:`, err);
                reject(err);
                done(err);
            });
    });
};
