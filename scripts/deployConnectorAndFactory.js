const TruffleConfig = require("@truffle/config");
const ConnectorFactory = artifacts.require("ConnectorFactory");
const BptReferralConnector = artifacts.require("BptReferralConnector");

const contractSettings = {
    connectorFactory: {
        vlxtest: {
            rewardManager: "0x7D031D64a58812091b7147818314ebd60FF69B83",
            wrappedToken: "0x78f18612775a2c54efc74c2911542aa034fe8d3f"
        },
        vlxmain: {},
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
        contractSettings["connectorFactory"][network]["wrappedToken"]
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
