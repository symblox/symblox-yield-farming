const {ethers} = require("hardhat");
const {getNetworkInfo} = require("./utils");

const contractSettings = {
    connectorFactory: {
        vlxtest: {
            rewardManager: "0x7924a8d124C04492c8653912004532C2a9CDFe59",
            wrappedToken: "0x78f18612775a2c54efc74c2911542aa034fe8d3f"
        },
        vlxmain: {},
        bsctest: {},
        bscmain: {}
    }
};

async function main() {
    const [deployer] = await ethers.getSigners();

    const [networkId, networkName] = await getNetworkInfo();
    console.log({id: networkId, name: networkName});

    const ConnectorFactory = await ethers.getContractFactory(
        "ConnectorFactory",
        deployer
    );
    const connectorFactoryContract = await ConnectorFactory.deploy(
        contractSettings["connectorFactory"][networkName]["rewardManager"],
        contractSettings["connectorFactory"][networkName]["wrappedToken"]
    );
    console.log(
        `connectorFactory address is ${connectorFactoryContract.address}`
    );

    const BptReferralConnector = await ethers.getContractFactory(
        "BptReferralConnector",
        deployer
    );
    const bptReferralConnectorContract = await BptReferralConnector.deploy();
    console.log(
        `bptReferralConnector address is ${bptReferralConnectorContract.address}`
    );
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
