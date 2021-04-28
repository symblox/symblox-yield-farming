const TruffleConfig = require("@truffle/config");
const RewardManager = artifacts.require("RewardManager");

const contractSettings = {
    rewardManager: {
        vlxtest: {
            syx: "0xa94BFDE008232f03A7C34b7B994CcAA07a28283D",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "2948800",
            endBlock: "3674560",
            bonusEndBlock: "2948800",
            initSupply: "800000000000000000000000", //800000
            rewardEscrow: "0x0000000000000000000000000000000000000000"
            // seasonBlocks: "725760" //42day 5sec per block
        },
        vlxmain: {
            syx: "",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            rewardEscrow: "0x0000000000000000000000000000000000000000"
            // startBlock: "",
            // bonusEndBlock: "",
            // seasonBlocks: "725760"
        },
        bsctest: {
            syx: "0x909cE73d92a7e89D31Ac23E401BE65C538bD4355",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "8370500",
            endBlock: "9580100",
            bonusEndBlock: "8370500",
            initSupply: "520000000000000000000000", //520000
            rewardEscrow: "0xd793E6bA9b30E237374dEb1975bae19e689AeaC8"
        },
        bscmain: {
            syx: "",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            rewardEscrow: "0x0000000000000000000000000000000000000000"
            // startBlock: "",
            // bonusEndBlock: "",
            // seasonBlocks: "1209600" //42day 3sec per block
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

    const rewardManagerContract = await RewardManager.new(
        contractSettings["rewardManager"][network]["syx"],
        contractSettings["rewardManager"][network]["devaddr"],
        contractSettings["rewardManager"][network]["startBlock"],
        contractSettings["rewardManager"][network]["endBlock"],
        contractSettings["rewardManager"][network]["bonusEndBlock"],
        contractSettings["rewardManager"][network]["initSupply"],
        contractSettings["rewardManager"][network]["rewardEscrow"]
    );
    console.log(`rewardManager address is ${rewardManagerContract.address}`);
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
