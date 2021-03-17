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
            initSupply: "8000000000000000000000000" //8000000
            // seasonBlocks: "725760" //42day 5sec per block
        },
        vlxmain: {
            syx: "0xD0CB9244844F3E11061fb3Ea136Aab3a6ACAC017",
            devaddr: "0x17d8A87BF9F3f8ca7469D576d958bE345c1D9D5D",
            startBlock: "5903198",
            endBlock: "6628958",
            bonusEndBlock: "5903198",
            initSupply: "512000000000000000000000" //8000000
        },
        bsctest: {
            syx: "0xd2f83494cd97e61f117015ba79cbf8f42fd13634",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d"
            // startBlock: "6447650",
            // bonusEndBlock: "6447650",
            // seasonBlocks: "1209600" //42day 3sec per block
        },
        bscmain: {
            syx: "",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d"
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
        contractSettings["rewardManager"][network]["initSupply"]
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
