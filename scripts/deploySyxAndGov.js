const TruffleConfig = require("@truffle/config");
const Symblox = artifacts.require("SymbloxToken");
const Timelock = artifacts.require("Timelock");
const Governor = artifacts.require("Governor");

const contractSettings = {
    syx: {
        vlxtest: [
            "0xC20932B245840CA1C6F8c9c90BDb2F4E0289DE48",
            "0x28a6312D786e9d7a78637dD137AbeF5332F3b2Aa"
        ],
        vlxmain: [
            "0x2de7063fe77aAFB5b401d65E5A108649Ec577170",
            "0x01Db6ACFA20562Ba835aE9F5085859580A0b1386"
        ]
    },
    timelock: {
        vlxtest: {
            admin: "0x0E97a61Eca9048bFABFe663727fb759474264277",
            delay: "1800"
        },
        vlxmain: {
            admin: "",
            delay: ""
        }
    },
    governor: {
        vlxtest: {
            guardian: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            votingPeriod: "17280" //~1 day in blocks (assuming 5s blocks)
        },
        vlxmain: {
            guardian: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
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

    if (network !== "bsctest" && network !== "bscmain") {
        const syxContract = await Symblox.new(
            "Symblox V3",
            "SYX",
            18,
            contractSettings["syx"][network]
        );
        console.log(`syx address is ${syxContract.address}`);

        const timelockContract = await Timelock.new(
            contractSettings["timelock"][network]["admin"],
            contractSettings["timelock"][network]["delay"]
        );
        console.log(`timelock address is ${timelockContract.address}`);

        const governorContract = await Governor.new(
            timelockContract.address,
            syxContract.address,
            contractSettings["governor"][network]["guardian"],
            contractSettings["governor"][network]["votingPeriod"]
        );
        console.log(`governor address is ${governorContract.address}`);

        await syxContract.transferOwnership(timelockContract.address);
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
