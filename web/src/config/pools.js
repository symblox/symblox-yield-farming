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
    id: "VLX/SYX2",
    featured: false,
    name: "VLX",
    website: "Reward Pool",
    address: config.vlxSyxBpt,
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
    id: "pVLX/SYX2",
    featured: false,
    name: "pVLX",
    website: "Reward Pool",
    address: config.pVlxBpt,
    symbol: "BPT",
    ROI: "DF",
    type: "swap",
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

let usdtSyxPool = {
    id: "USDT/SYX2",
    featured: false,
    name: "USDT",
    website: "Reward Pool",
    address: config.usdtSyxBpt,
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
    referral: true,
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

let vlxEthPool = {
    id: "VLX/ETH",
    featured: false,
    name: "VLX",
    website: "Reward Pool",
    address: config.vlxEthBpt,
    symbol: "BPT",
    ROI: "DF",
    type: "swap-native",
    referral: false,
    tokens: ["ETH", "VLX"], //reward token must in first
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
    erc20Address2: config.weth,
    erc20ABI2: config.erc20ABI,
    erc20Decimals2: 18,
    poolAddress: config.rewardPool,
    poolABI: config.rewardPoolABI
};

let ethSyxPool = {
    id: "ETH/SYX2",
    featured: false,
    name: "ETH",
    website: "Reward Pool",
    address: config.ethSyxBpt,
    symbol: "BPT",
    ROI: "DF",
    type: "swap",
    referral: false,
    tokens: ["SYX", "ETH"], //reward token must in first
    abi: config.bptABI,
    decimals: 18,
    rewardsAddress: config.syx,
    rewardsABI: config.syxABI,
    rewardsSymbol: "SYX",
    entryContractABI: config.bptRefConnectorABI,
    entryContractFactoryAddress: config.connectorFactory,
    entryContractFactoryABI: config.connectorFactoryABI,
    erc20Address: config.weth,
    erc20ABI: config.erc20ABI,
    erc20Decimals: 18,
    erc20Address2: config.syx,
    erc20ABI2: config.erc20ABI,
    erc20Decimals2: 18,
    poolAddress: config.rewardPool,
    poolABI: config.rewardPoolABI
};

function getPools() {
    // assign pool IDs to the pools
    if (process.env.REACT_APP_ENV === "production") {
        [
            vlxPool.index,
            vlxUsdtPool.index,
            usdtSyxPool.index,
            ethSyxPool.index,
            vlxEthPool.index,
        ] = [
            0,
            1,
            2,
            3,
            4
        ];
        return [
            vlxPool,
            vlxUsdtPool,
            usdtSyxPool,
            ethSyxPool,
            vlxEthPool
        ];
    } else {
        [
            vlxPool.index,
            vlxUsdtPool.index,
            usdtSyxPool.index,
            ethSyxPool.index,
            vlxEthPool.index,
        ] = [
            0,
            1,
            2,
            3,
            4
        ];
        return [
            vlxPool,
            vlxUsdtPool,
            usdtSyxPool,
            ethSyxPool,
            vlxEthPool
        ];
    }
}
export default getPools;
