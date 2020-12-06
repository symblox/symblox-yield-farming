import React from "react";

export const CONNECTION_CONNECTED = "CONNECTION_CONNECTED";
export const CONNECTION_DISCONNECTED = "CONNECTION_DISCONNECTED";

export const ERROR = "ERROR";

export const CONFIGURE = "CONFIGURE";
export const CONFIGURE_RETURNED = "CONFIGURE_RETURNED";

export const GET_REWARDS = "GET_REWARDS";
export const GET_REWARDS_RETURNED = "GET_REWARDS_RETURNED";

export const TRADE = "TRADE";
export const TRADE_RETURNED = "TRADE_RETURNED";

export const DEPOSIT = "DEPOSIT";
export const DEPOSIT_RETURNED = "DEPOSIT_RETURNED";

export const WITHDRAW = "WITHDRAW";
export const WITHDRAW_RETURNED = "WITHDRAW_RETURNED";

export const GET_BALANCES_PERPETUAL = "GET_BALANCES_PERPETUAL";
export const GET_BALANCES_PERPETUAL_RETURNED =
    "GET_BALANCES_PERPETUAL_RETURNED";

export const CREATE_ENTRY_CONTRACT = "CREATE_ENTRY_CONTRACT";
export const CREATE_ENTRY_CONTRACT_RETURNED = "CREATE_ENTRY_CONTRACT_RETURNED";

export const CALCULATE_PRICE = "CALCULATE_PRICE";
export const CALCULATE_PRICE_RETURNED = "CALCULATE_PRICE_RETURNED";

export const CALCULATE_AMOUNT = "CALCULATE_AMOUNT";
export const CALCULATE_AMOUNT_RETURNED = "CALCULATE_AMOUNT_RETURNED";

export const CALCULATE_BPT_AMOUNT = "CALCULATE_BPT_AMOUNT";
export const CALCULATE_BPT_AMOUNT_RETURNED = "CALCULATE_BPT_AMOUNT_RETURNED";

export const TX_CONFIRM = "TX_CONFIRM";

export const languageOptions = [
    {
        key: "en",
        value: "EN"
    },
    {
        key: "zh",
        value: "中"
    }
];

export const nodeConfigs = {
    infuraId:
        process.env.REACT_APP_INFURA_ID || "61a5aaecc27646d9ba6ece87c1065806"
};

export const networkOptions = [
    {
        value: 106,
        key: 1,
        bridge: {chainId: 1, name: "ETH Mainnet"},
        label: "VELAS",
        name: "VELAS"
    },
    {
        value: 1,
        key: 0,
        bridge: {chainId: 106, name: "VELAS"},
        label: "Mainnet",
        name: "ETH Mainnet"
    },
    {
        value: 111,
        key: 3,
        bridge: {chainId: 42, name: "Kovan Testnet"},
        label: "VELAS (Testnet)",
        name: "VELAS Testnet"
    },
    {
        value: 42,
        key: 4,
        bridge: {chainId: 111, name: "VELAS Testnet"},
        label: "Kovan",
        name: "Kovan Testnet"
    }
];
