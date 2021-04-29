require("dotenv").config();
const mnemonic = process.env.MNEMONIC;
const privateKey = process.env.PRIVATE_KEY;
const HDWalletProvider = require("@truffle/hdwallet-provider");
const VLX_MAIN_RPC = "https://explorer.velas.com/rpc";
const VLX_TEST_RPC = "https://explorer.testnet.veladev.net/rpc";
const BSC_MAIN_RPC = "https://bsc-dataseed.binance.org/";
const BSC_TEST_RPC = "https://data-seed-prebsc-2-s1.binance.org:8545/";

const configVlxNetwok = (networkId, gasPrice = 22000, gas = 8000000) => ({
    provider: () =>
        networkId == 106
            ? mnemonic
                ? new HDWalletProvider(mnemonic, VLX_MAIN_RPC, 0)
                : new HDWalletProvider(privateKey, VLX_MAIN_RPC, 0)
            : mnemonic
            ? new HDWalletProvider(mnemonic, VLX_TEST_RPC, 0)
            : new HDWalletProvider(privateKey, VLX_TEST_RPC, 0),
    network_id: networkId,
    gas,
    gasPrice
});

const configBscNetwok = (networkId, gasPrice = 2e10, gas = 8000000) => ({
    provider: () =>
        networkId == 56
            ? mnemonic
                ? new HDWalletProvider(mnemonic, BSC_MAIN_RPC, 0)
                : new HDWalletProvider(privateKey, BSC_MAIN_RPC, 0)
            : mnemonic
            ? new HDWalletProvider(mnemonic, BSC_TEST_RPC, 0)
            : new HDWalletProvider(privateKey, BSC_TEST_RPC, 0),
    network_id: networkId,
    gas,
    gasPrice
});

module.exports = {
    plugins: ["solidity-coverage"],
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 10000000,
            gasPrice: 1000000000 // web3.eth.gasPrice
        },
        coverage: {
            host: "localhost",
            port: 8555,
            network_id: "*",
            gas: 10000000,
            gasPrice: 1000000000 // web3.eth.gasPrice
        },
        vlxtest: configVlxNetwok(111),
        vlxmain: configVlxNetwok(106),
        bsctest: configBscNetwok(97),
        bscmain: configBscNetwok(56)
    },
    compilers: {
        solc: {
            version: "0.5.17",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                evmVersion: "istanbul"
            }
        }
    },
    mocha: {
        slow: "10000"
    }
};
