const {ethers} = require("hardhat");

const getNetworkInfo = async () => {
    const networkId = await (await ethers.provider.getNetwork()).chainId;
    const networks = {
        56: "bscmainnet",
        97: "bsctestnet",
        106: "vlxmain",
        111: "vlxtest",
        31337: "localhost"
    };
    return [networkId, networks[networkId.toString()]];
};

module.exports = {getNetworkInfo};
