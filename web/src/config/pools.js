import env from "./env";
const config = env;
let seedPool = {
    id: "VLX",
    featured: true,
    name: "VLX",
    website: "Reward Pool",
    index: 0,
    address: config.wvlx,
    symbol: "VLX",
    ROI: "DF",
    type: "seed",
    tokens: ["VLX"],
    abi: config.erc20ABI,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 18,
    decimals: 18,
    entryContractABI: config.wvlxConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    poolAddress: config.rewardPool,
    poolABI: config.rewardPoolABI
};

let vlxPool = {
    id: "VLX/SYX",
    featured: false,
    name: "VLX",
    website: "Reward Pool",
    index: 1,
    address: config.bpt,
    symbol: "BPT",
    ROI: "DF",
    type: "swap-native",
    tokens: ["SYX", "VLX"], //reward token must in first
    abi: config.bptABI,
    decimals: 18,
    erc20Address: config.wvlx,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 18,
    entryContractABI: config.bptRefConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    poolAddress: config.rewardPool,
    poolABI: config.rewardPoolABI
};

let ticketPool = {
    id: "pVLX/SYX",
    featured: false,
    name: "pVLX",
    website: "Reward Pool",
    address: config.pVlxBpt,
    symbol: "BPT",
    ROI: "DF",
    type: "swap",
    tokens: ["SYX", "pVLX"], //reward token must in first
    abi: config.bptABI,
    decimals: 18,
    erc20Address: config.pVlx,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 18,
    entryContractABI: config.bptRefConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    poolAddress: config.rewardPool,
    poolABI: config.rewardPoolABI
};

let usdtPool = {
    id: "USDT/SYX",
    featured: false,
    name: "USDT",
    website: "Reward Pool",
    address: config.usdtBpt,
    symbol: "BPT",
    ROI: "DF",
    type: "swap",
    referral: true,
    tokens: ["SYX", "USDT"], //reward token must in first
    abi: config.bptABI,
    decimals: 18,
    erc20Address: config.usdt,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 6,
    entryContractABI: config.bptRefConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    poolAddress: config.rewardPool,
    poolABI: config.rewardPoolABI
};

function getPools() {
    if (process.env.REACT_APP_ENV === "production") {
        usdtPool.index = 2;
        return [seedPool, vlxPool, usdtPool];
    } else {
        usdtPool.index = 4;
        ticketPool.index = 3;
        return [seedPool, vlxPool, ticketPool, usdtPool];
    }
}
export default getPools;
