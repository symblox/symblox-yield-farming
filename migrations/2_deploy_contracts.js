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
                rewardsPerBlock: "74000000000000000", // 1 syx
                startBlock: "872300",
                bonusEndBlock: "941420",
                endBlock: "981420"
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
        ADMIN, // dev address
        contractSettings["RewardManager"][network]["rewardsPerBlock"],
        contractSettings["RewardManager"][network]["startBlock"],
        contractSettings["RewardManager"][network]["bonusEndBlock"],
        contractSettings["RewardManager"][network]["endBlock"]
    );

    // Transfer Symblox to the RewardManager
    await syx.transferOwnership(rewardMgr.address);
};
