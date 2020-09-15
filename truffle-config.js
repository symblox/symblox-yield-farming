require("dotenv").config();
const mnemonic = process.env.MNEMONIC;
const privateKey = process.env.PRIVATE_KEY;
const HDWalletProvider = require("@truffle/hdwallet-provider");

const configVlxNetwok = (networkId, gasPrice = 1e9, gas = 3000000) => ({
    provider: () =>
        mnemonic
            ? new HDWalletProvider(mnemonic, "https://tn.yopta.net", 0)
            : new HDWalletProvider(privateKey, "https://tn.yopta.net", 0),
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
            gas: 8000000,
            gasPrice: 1000000000 // web3.eth.gasPrice
        },
        coverage: {
            host: "localhost",
            port: 8555,
            network_id: "*",
            gas: 8000000,
            gasPrice: 1000000000 // web3.eth.gasPrice
        },
        vlxtest: configVlxNetwok(111)
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
