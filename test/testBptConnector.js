const {
    ether,
    expectEvent,
    expectRevert
} = require("@openzeppelin/test-helpers");
const abi = require("ethereumjs-abi");
const constants = require("@openzeppelin/test-helpers/src/constants");
const {expect} = require("chai");
const MockContract = artifacts.require("MockContract");
const BptConnector = artifacts.require("BptConnector");
const BPool = artifacts.require("BPool");
const RewardManager = artifacts.require("RewardManager");

contract("BptConnector", ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.tokenMock = await MockContract.new();

        // RewardManager Mock
        this.rewardManagerMock = await MockContract.new();
        this.rewardMgr = await RewardManager.at(this.rewardManagerMock.address);
        // BPool Mock
        this.bpoolMock = await MockContract.new();
        this.bpool = await BPool.at(this.bpoolMock.address);

        this.bptConn = await BptConnector.new();
        const poolId = 0;
        await this.bptConn.initialize(
            alice,
            this.rewardManagerMock.address,
            this.bpoolMock.address,
            poolId
        );
    });

    it("should create BptConnector", async () => {
        rewardManagerMock = await MockContract.new();
        const lpTokenMock = await MockContract.new();

        const conn = await BptConnector.new();
        const poolId = 1;
        const initTx = await conn.initialize(
            alice,
            rewardManagerMock.address,
            lpTokenMock.address,
            poolId
        );
        expectEvent(initTx, "LogInit", {
            owner: alice,
            rewardManager: rewardManagerMock.address,
            lpToken: lpTokenMock.address
        });
    });

    it("should deposit native token to BptConnector", async () => {
        const depositAmount = ether("1");
        // Mock function calls
        const joinSwapMethod = this.bpool.contract.methods
            .joinswapWTokenIn(0)
            .encodeABI();
        await this.bpoolMock.givenMethodReturnUint(
            joinSwapMethod,
            depositAmount
        );
        const userInfoMethod = this.rewardMgr.contract.methods
            .userInfo(0, constants.ZERO_ADDRESS)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            userInfoMethod,
            abi.rawEncode(["uint256", "uint256"], [0, 0])
        );
        const depositMethod = this.rewardMgr.contract.methods
            .deposit(0, 0)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturnUint(
            depositMethod,
            depositAmount
        );

        const depositTx = await this.bptConn.methods["deposit(uint256)"](0, {
            value: depositAmount
        });

        expectEvent(depositTx, "LogDeposit", {
            amount: depositAmount
        });
    });
    it("should withdraw native token from BptConnector", async () => {
        const amount = ether("1");
        // Mock function calls
        const exitSwapMethod = this.bpool.contract.methods
            .exitswapPoolAmountInWTokenOut(0, 0)
            .encodeABI();
        await this.bpoolMock.givenMethodReturnUint(exitSwapMethod, amount);
        const userInfoMethod = this.rewardMgr.contract.methods
            .userInfo(0, constants.ZERO_ADDRESS)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            userInfoMethod,
            abi.rawEncode(["uint256", "uint256"], [ether("1"), 0])
        );
        const withdrawMethod = this.rewardMgr.contract.methods
            .withdraw(0, 0)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturnUint(withdrawMethod, 0);

        // const withdrawFailTx = this.bptConn.withdraw(amount, 0);
        // expectRevert(withdrawFailTx, "ERR_BAL_INSUFFICIENT");

        // Needs to send withdraw amout of native tokens to the connector
        web3.eth.sendTransaction({
            from: alice,
            to: this.bptConn.address,
            value: amount
        });

        const withdrawTx = await this.bptConn.withdraw(amount, 0);
        // for (let log of withdrawTx.logs) {
        //     // console.log({log});
        //     console.log(`${log.event} -> ${log.args.amount.toString()}`);
        // }
        expectEvent(withdrawTx, "LogWithdrawal", {
            amount: amount
        });
    });
});
