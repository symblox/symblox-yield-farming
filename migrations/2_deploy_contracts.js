const Symblox = artifacts.require("SymbloxToken");
const RewardManager = artifacts.require("RewardManager");

module.exports = async function (deployer, network, accounts) {
    const ADMIN = accounts[0];

    const contractSettings = {
        RewardManager: {
            development: {
                rewardsPerBlock: "1000000000000000000", // 1 syx
                startBlock: "100",
                bonusEndBlock: "100000",
                endBlock: "100100"
            },
            coverage: {
                rewardsPerBlock: "1000000000000000000", // 1 syx
                startBlock: "100",
                bonusEndBlock: "100000",
                endBlock: "100100"
            },
            vlxtest: {
                rewardsPerBlock: "688932980599647000", // 0.688932980599647
                startBlock: "1052894",
                bonusEndBlock: "1294814",
                endBlock: "2020574"
            },
            vlxmain: {
                rewardsPerBlock: "688932980599647000", // 0.688932980599647
                startBlock: "3326255",
                bonusEndBlock: "3568175",
                endBlock: "4293935"
            }
        }
    };

    await deployer.deploy(
        Symblox,
        "0x0000000000000000000000000000000000000000"
    );
    const syx = await Symblox.deployed();

    const rewardMgr = await deployer.deploy(
        RewardManager,
        syx.address, // reward token
        "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d", // dev address
        contractSettings["RewardManager"][network]["rewardsPerBlock"],
        contractSettings["RewardManager"][network]["startBlock"],
        contractSettings["RewardManager"][network]["bonusEndBlock"],
        contractSettings["RewardManager"][network]["endBlock"]
    );

    // Transfer Symblox to the RewardManager
    await syx.transferOwnership(rewardMgr.address);
};
