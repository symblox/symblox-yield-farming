require("dotenv").config();
const mnemonic = process.env.MNEMONIC;
const privateKey = process.env.PRIVATE_KEY;
const HDWalletProvider = require("@truffle/hdwallet-provider");
const VLX_MAIN_RPC = "https://rpc.symblox.net:8080/";
const VLX_TEST_RPC = "https://explorer.testnet.veladev.net/rpc";

const configVlxNetwok = (networkId, gasPrice = 22000, gas = 3000000) => ({
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
        vlxmain: configVlxNetwok(106)
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
