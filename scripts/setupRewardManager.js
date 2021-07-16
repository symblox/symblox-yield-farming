const {ethers} = require("hardhat");
const {getNetworkInfo} = require("./utils");

const contractSettings = {
    rewardManager: {
        vlxtest: {
            address: "0x7924a8d124C04492c8653912004532C2a9CDFe59",
            pools: [
                {
                    allocPoint: "5000000000000000000", //5
                    lpToken: "0x72c3F39e57c8306e29d088ABFc1C24427649c9f9" //vlxSyx
                },
                {
                    allocPoint: "2500000000000000000", //2.5
                    lpToken: "0x988269D4599Da30C926a7946D84Ce441a88ceDd2" //ethSyx
                },
                {
                    allocPoint: "2500000000000000000", //2.5
                    lpToken: "0x5dB61B3C05c1B7d1845123F77448888057D96184" //usdtSyx
                }
            ]
        }
    },
    connectorFactory: {
        vlxtest: {
            address: "0x6C7D0CB3a0524BA91969Dd468313d34370c4b189",
            impl: "0x48cA5665f5d83d5f41B478Bf0Eca2e01467F4F54"
        }
    }
};

async function main() {
    const [deployer] = await ethers.getSigners();

    const [networkId, networkName] = await getNetworkInfo();
    console.log({id: networkId, name: networkName});

    const RewardManager = await ethers.getContractFactory(
        "RewardManager",
        deployer
    );
    const rewardManagerContract = await RewardManager.attach(
        contractSettings["rewardManager"][networkName]["address"]
    );
    for (
        let i = 0;
        i < contractSettings["rewardManager"][networkName].pools.length;
        i++
    ) {
        await rewardManagerContract.add(
            contractSettings["rewardManager"][networkName].pools[i][
                "allocPoint"
            ],
            contractSettings["rewardManager"][networkName].pools[i]["lpToken"],
            false
        );
    }
    console.log("rewardManager add end");

    const ConnectorFactory = await ethers.getContractFactory(
        "ConnectorFactory",
        deployer
    );
    const connectorFactoryContract = await ConnectorFactory.attach(
        contractSettings["connectorFactory"][networkName]["address"]
    );
    for (
        let i = 0;
        i < contractSettings["rewardManager"][networkName].pools.length;
        i++
    ) {
        await connectorFactoryContract.setConnectorImpl(
            i,
            contractSettings["connectorFactory"][networkName]["impl"]
        );
    }
    console.log("connectorFactory setConnectorImpl end");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
