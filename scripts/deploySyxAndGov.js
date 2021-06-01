const {ethers} = require("hardhat");
const {getNetworkInfo} = require("./utils");

const contractSettings = {
    syx: {
        vlxtest: {
            symbol: "SYX",
            name: "Symblox",
            decimals: 18,
            oldSyxs: [
                "0xC20932B245840CA1C6F8c9c90BDb2F4E0289DE48",
                "0x28a6312D786e9d7a78637dD137AbeF5332F3b2Aa",
                "0x946b06FE625aB1AaA27294F8ed09713C8812626c"
            ],
            exchangeDeadline: "296240" //from block 244400 ~6 days in blocks (assuming 10s blocks)
        },
        vlxmain: {
            symbol: "SYX",
            name: "Symblox",
            decimals: 18,
            oldSyxs: [
                "0x2de7063fe77aAFB5b401d65E5A108649Ec577170",
                "0x01Db6ACFA20562Ba835aE9F5085859580A0b1386"
            ],
            exchangeDeadline: ""
        }
    },
    timelock: {
        vlxtest: {
            delay: "300" // in seconds
        },
        vlxmain: {
            delay: "86400"
        }
    },
    governor: {
        vlxtest: {
            guardian: "0x0E97a61Eca9048bFABFe663727fb759474264277", //admin
            votingPeriod: "8640" //~24 hours in blocks (assuming 10s blocks)
        },
        vlxmain: {
            guardian: "0x561a0898ab6Ea2A2EFa740FDed2f9b208b5D1455", //admin
            votingPeriod: "34560" //~2 day in blocks (assuming 5s blocks)
        }
    }
};

async function main() {
    const [deployer] = await ethers.getSigners();

    const [networkId, networkName] = await getNetworkInfo();
    console.log({id: networkId, name: networkName});

    const SymbloxToken = await ethers.getContractFactory(
        "SymbloxToken",
        deployer
    );
    const syxContract = await SymbloxToken.deploy(
        contractSettings["syx"][networkName]["name"],
        contractSettings["syx"][networkName]["symbol"],
        contractSettings["syx"][networkName]["decimals"],
        contractSettings["syx"][networkName]["oldSyxs"],
        contractSettings["syx"][networkName]["exchangeDeadline"]
    );
    console.log(`syx address is ${syxContract.address}`);

    const Governor = await ethers.getContractFactory("Governor", deployer);
    const governorContract = await Governor.deploy(
        syxContract.address,
        contractSettings["governor"][networkName]["guardian"],
        contractSettings["governor"][networkName]["votingPeriod"]
    );
    console.log(`governor address is ${governorContract.address}`);

    const Timelock = await ethers.getContractFactory("Timelock", deployer);
    const timelockContract = await Timelock.deploy(
        governorContract.address,
        contractSettings["timelock"][networkName]["delay"]
    );
    console.log(`timelock address is ${timelockContract.address}`);

    await governorContract.initTimelock(timelockContract.address);
    await syxContract.addMinter(timelockContract.address);
    console.log(`add syx minter address is ${timelockContract.address}`);
    if (networkName == "vlxmain") {
        await syxContract.renounceMinter();
    } else {
        //Annotate first for the convenience of testing
        //await syxContract.renounceMinter();
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
