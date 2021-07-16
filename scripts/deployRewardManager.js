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
            initSupply: "520000000000000000000000", //520000
            rewardEscrow: "0x0000000000000000000000000000000000000000"
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
            syx: "0x47c11E73FaeA96F981c44c8B068a328f3a83d8e9",
            devaddr: "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d",
            startBlock: "8398000",
            endBlock: "9604900",
            bonusEndBlock: "8395000",
            initSupply: "520000000000000000000000", //520000
            rewardEscrow: "0xaC16eF7BB6232a957Ec72770fcD65B0d4edb81dE"
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
    const [deployer] = await ethers.getSigners();

    const [networkId, networkName] = await getNetworkInfo();
    console.log({id: networkId, name: networkName});

    const RewardManager = await ethers.getContractFactory(
        "RewardManager",
        deployer
    );
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

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
