import env from "./env";
const config = env;
//If syx is a tradable token of the pool, it is defined to erc20Address2
//If vlx is a tradable token of the pool, it is defined to erc20Address
let seedPool = {
    id: "VLX",
    featured: true,
    name: "VLX",
    website: "Reward Pool",
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
    address: config.bpt,
    symbol: "BPT",
    ROI: "DF",
    type: "swap-native",
    tokens: ["SYX", "VLX"], //reward token must in first
    abi: config.bptABI,
    decimals: 18,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    entryContractABI: config.bptRefConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    erc20Address: config.wvlx,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 18,
    erc20Address2: config.syx,
    erc20ABI2: config.syxABI,
    erc20Decimals2: 18,
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
    referral: true,
    tokens: ["SYX", "pVLX"], //reward token must in first
    abi: config.bptABI,
    entryContractABI: config.bptRefConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    decimals: 18,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    erc20Address: config.pVlx,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 18,
    erc20Address2: config.syx,
    erc20ABI2: config.syxABI,
    erc20Decimals2: 18,
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
    entryContractABI: config.bptRefConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    erc20Address: config.usdt,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 6,
    erc20Address2: config.syx,
    erc20ABI2: config.syxABI,
    erc20Decimals2: 18,
    poolAddress: config.rewardPool,
    poolABI: config.rewardPoolABI
};

let vlxUsdtPool = {
    id: "VLX/USDT",
    featured: false,
    name: "VLX",
    website: "Reward Pool",
    address: config.vlxUsdtBpt,
    symbol: "BPT",
    ROI: "DF",
    type: "swap-native",
    tokens: ["USDT", "VLX"], //reward token must in first
    abi: config.bptABI,
    decimals: 18,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    entryContractABI: config.bptRefConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    erc20Address: config.wvlx,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 18,
    erc20Address2: config.usdt,
    erc20ABI2: config.erc20ABI,
    erc20Decimals2: 6,
    poolAddress: config.rewardPool,
    poolABI: config.rewardPoolABI
};

function getPools() {
    // assign pool IDs to the pools
    if (process.env.REACT_APP_ENV === "production") {
        [seedPool.index, vlxPool.index, usdtPool.index] = [0, 1, 2];
        return [seedPool, vlxPool, usdtPool];
    } else {
        [
            seedPool.index, 
            vlxPool.index, 
            // ticketPool.index, 
            usdtPool.index, 
            vlxUsdtPool.index
        ] = [
            0,
            1,
            // 3,
            4,
            5
        ];
        return [
            seedPool, 
            vlxPool, 
            // ticketPool, 
            usdtPool, 
            vlxUsdtPool
        ];
    }
}
export default getPools;
