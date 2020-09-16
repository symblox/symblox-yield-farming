module.exports = {
    providerOptions: {
        default_balance_ether: 2000000,
        gasLimit: 0xfffffffffff,
        mnemonic:
            "myth like bonus scare over problem client lizard pioneer submit female collect"
    },
    norpc: true,
    skipFiles: [
        "Migrations.sol",
        "mocks",
        "interfaces",
        "tokens",
        "libs",
        "balancer"
    ]
};
