const {ethers} = require("hardhat");
const {getNetworkInfo} = require("./utils");

const contractSettings = {
    rewardManager: {
        vlxtest: {
            syx: "0xC119b1d91b44012Db8d0ac5537f04c7FD7629c84",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "244400",
            endBlock: "607280",
            bonusEndBlock: "244400",
            initSupply: "520000000000000000000000" //520000
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
    const [deployer] = await ethers.getSigners();

    const [networkId, networkName] = await getNetworkInfo();
    console.log({id: networkId, name: networkName});

    const RewardManager = await ethers.getContractFactory(
        "RewardManager",
        deployer
    );
    const rewardManagerContract = await RewardManager.deploy(
        contractSettings["rewardManager"][networkName]["syx"],
        contractSettings["rewardManager"][networkName]["devaddr"],
        contractSettings["rewardManager"][networkName]["startBlock"],
        contractSettings["rewardManager"][networkName]["endBlock"],
        contractSettings["rewardManager"][networkName]["bonusEndBlock"],
        contractSettings["rewardManager"][networkName]["initSupply"]
    );
    console.log(`rewardManager address is ${rewardManagerContract.address}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
