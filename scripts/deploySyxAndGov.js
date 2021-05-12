const TruffleConfig = require("@truffle/config");
const Symblox = artifacts.require("SymbloxToken");
const Timelock = artifacts.require("Timelock");
const Governor = artifacts.require("Governor");

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
            exchangeDeadline: "153640" //from block 101800 ~6 days in blocks (assuming 10s blocks)
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
    const networkName = process.argv[process.argv.length - 1];
    let truffleConfig = TruffleConfig.detect({network: networkName});
    const network = truffleConfig.networks[networkName]
        ? networkName
        : "development";
    if (!truffleConfig.networks[networkName]) {
        truffleConfig = TruffleConfig.detect({network});
    }
    console.log(`Running script with the ${network} network...`);

    const syxContract = await Symblox.new(
        contractSettings["syx"][network]["name"],
        contractSettings["syx"][network]["symbol"],
        contractSettings["syx"][network]["decimals"],
        contractSettings["syx"][network]["oldSyxs"],
        contractSettings["syx"][network]["exchangeDeadline"]
    );
    console.log(`syx address is ${syxContract.address}`);

    const governorContract = await Governor.new(
        syxContract.address,
        contractSettings["governor"][network]["guardian"],
        contractSettings["governor"][network]["votingPeriod"]
    );
    console.log(`governor address is ${governorContract.address}`);

    const timelockContract = await Timelock.new(
        governorContract.address,
        contractSettings["timelock"][network]["delay"]
    );
    console.log(`timelock address is ${timelockContract.address}`);

    await governorContract.initTimelock(timelockContract.address);
    await syxContract.addMinter(timelockContract.address);
    console.log(`add syx minter address is ${timelockContract.address}`);
    //Annotate first for the convenience of testing
    if (network == "vlxmain") {
        await syxContract.renounceMinter();
    } else {
        //await syxContract.renounceMinter();
    }
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
