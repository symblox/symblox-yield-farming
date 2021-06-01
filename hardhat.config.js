require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
const {task} = require("hardhat/config");
require("hardhat-gas-reporter");

task("accounts", "Prints the list of accounts", async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

const privateKey = process.env.PRIVATE_KEY;

module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.5.17",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    },
                    evmVersion: "istanbul"
                }
            }
        ]
    },
    paths: {
        tests: "./test",
        sources: "./contracts"
    },
    networks: {
        vlxmain: {
            url: "https://explorer.velas.com/rpc",
            accounts: [privateKey],
            timeout: 600000 // 10 mins
        },
        vlxtest: {
            url: "https://explorer.testnet.velas.com/rpc",
            accounts: [privateKey],
            timeout: 600000 // 10 mins
        },
        bsctest: {
            url: "https://data-seed-prebsc-2-s2.binance.org:8545/",
            accounts: [privateKey],
            timeout: 600000 // 10 mins
        }
    },
    mocha: {timeout: 120000},
    gasReporter: {
        currency: "USD",
        gasPrice: 10
    }
};
