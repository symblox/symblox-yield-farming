const TruffleConfig = require("@truffle/config");
const RewardManager = artifacts.require("RewardManager");

const contractSettings = {
    rewardManager: {
        vlxtest: {
            syx: "0x0711FA8e32a4548eb8Fec327275C2b5CD6f4F331",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "16500",
            endBlock: "379380",
            bonusEndBlock: "16500",
            initSupply: "520000000000000000000000" //520000
            // seasonBlocks: "725760" //42day 5sec per block
        },
        vlxmain: {
            syx: "",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d"
            // startBlock: "",
            // bonusEndBlock: "",
            // seasonBlocks: "725760"
        },
        bsctest: {
            syx: "0xd31216D08002f88c7aFE99F58245F05C8b59B046",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "7620000",
            endBlock: "8829600",
            bonusEndBlock: "7620000",
            initSupply: "520000000000000000000000" //520000
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
