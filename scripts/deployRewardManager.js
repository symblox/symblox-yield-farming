const TruffleConfig = require("@truffle/config");
const RewardManager = artifacts.require("RewardManager");
const Timelock = artifacts.require("Timelock");
const Governor = artifacts.require("Governor");

const contractSettings = {
    rewardManager: {
        vlxtest: {
            syx: "0xa94BFDE008232f03A7C34b7B994CcAA07a28283D",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "2177000",
            bonusEndBlock: "2177000",
            initSupply: "800000000000000000000000",
            seasonBlocks: "725760" //42day 5sec per block
        },
        vlxmain: {
            syx: "",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "",
            bonusEndBlock: "",
            initSupply: "",
            seasonBlocks: "725760"
        },
        bsctest: {
            syx: "0xd2f83494cd97e61f117015ba79cbf8f42fd13634",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "6447650",
            bonusEndBlock: "6447650",
            initSupply: "800000000000000000000000",
            seasonBlocks: "1209600" //42day 3sec per block
        },
        bscmain: {
            syx: "",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "",
            bonusEndBlock: "",
            initSupply: "",
            seasonBlocks: "1209600" //42day 3sec per block
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
        contractSettings["rewardManager"][network]["bonusEndBlock"],
        contractSettings["rewardManager"][network]["initSupply"],
        contractSettings["rewardManager"][network]["seasonBlocks"]
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
