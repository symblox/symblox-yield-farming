const Symblox = artifacts.require("SymbloxToken");
const RewardManager = artifacts.require("RewardManager");

module.exports = async function (deployer, network, accounts) {
    const ADMIN = accounts[0];

    const contractSettings = {
        RewardManager: {
            development: {
                syx: [],
                startBlock: "100",
                bonusEndBlock: "100000",
                seasonBlocks: "10",
                initSupply: "8000000000000000000" //8 syx
            },
            coverage: {
                syx: [],
                startBlock: "100",
                bonusEndBlock: "100000",
                seasonBlocks: "10",
                initSupply: "8000000000000000000" //8 syx
            },
            vlxtest: {
                syx: [
                    "0xC20932B245840CA1C6F8c9c90BDb2F4E0289DE48",
                    "0x28a6312D786e9d7a78637dD137AbeF5332F3b2Aa"
                ],
                startBlock: "2177000",
                bonusEndBlock: "2177900",
                seasonBlocks: "725760",
                initSupply: "800000000000000000000000" //800000 syx
            },
            vlxmain: {
                syx: [
                    "0x2de7063fe77aAFB5b401d65E5A108649Ec577170",
                    "0x01Db6ACFA20562Ba835aE9F5085859580A0b1386"
                ],
                startBlock: "4360518",
                bonusEndBlock: "4360518",
                seasonBlocks: "725760", //42day 5sec per block
                initSupply: "800000000000000000000000" //800000 syx
            },
            bsctest: {
                syx: "",
                startBlock: "6424440",
                bonusEndBlock: "6424440",
                seasonBlocks: "1209600", //42day 3sec per block
                initSupply: "800000000000000000000000" //800000 syx
            },
            bscmain: {
                syx: ""
            }
        }
    };

    let syxAddress;
    if (network == "bsctest" || network == "bscmain") {
        syxAddress = contractSettings["RewardManager"][network]["syx"];
    } else {
        await deployer.deploy(
            Symblox,
            "Symblox V3",
            "SYX",
            18,
            contractSettings["RewardManager"][network]["syx"]
        );
        syxAddress = (await Symblox.deployed()).address;
    }

    const rewardMgr = await deployer.deploy(
        RewardManager,
        syxAddress, // reward token
        "0x17d8a87bf9f3f8ca7469d576d958be345c1d9d5d", // dev address
        contractSettings["RewardManager"][network]["startBlock"],
        contractSettings["RewardManager"][network]["bonusEndBlock"],
        contractSettings["RewardManager"][network]["initSupply"],
        contractSettings["RewardManager"][network]["seasonBlocks"]
    );

    // Transfer Symblox to the RewardManager
    //await syx.transferOwnership(rewardMgr.address);
};
