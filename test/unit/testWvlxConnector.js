const {
    ether,
    expectEvent,
    expectRevert
} = require("@openzeppelin/test-helpers");
const abi = require("ethereumjs-abi");
const constants = require("@openzeppelin/test-helpers/src/constants");
const {expect} = require("chai");
const MockContract = artifacts.require("MockContract");
const WvlxConnector = artifacts.require("WvlxConnector");
const WVLX = artifacts.require("WVLX");
const RewardManager = artifacts.require("RewardManager");

contract("WvlxConnector", ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.rewardManagerMock = await MockContract.new();
        this.syxMock = await MockContract.new();
        this.rewardMgr = await RewardManager.at(this.rewardManagerMock.address);
        // create the lpToken contract
        this.wvlx = await WVLX.new();

        this.wvlxConn = await WvlxConnector.new();
        const poolId = 0;
        await this.wvlxConn.initialize(
            alice,
            this.rewardManagerMock.address,
            this.wvlx.address,
            this.wvlx.address,
            poolId
        );
    });

    it("should create wvlx connector", async () => {
        rewardManagerMock = await MockContract.new();
        const lpTokenMock = await MockContract.new();

        const conn = await WvlxConnector.new();
        const poolId = 1;
        const initTx = await conn.initialize(
            alice,
            rewardManagerMock.address,
            this.wvlx.address,
            lpTokenMock.address,
            poolId
        );
        expectEvent(initTx, "LogInit", {
            owner: alice,
            rewardManager: rewardManagerMock.address,
            lpToken: lpTokenMock.address
        });
    });

    it("should deposit to WVLX connector", async () => {
        const depositAmount = ether("1");
        // Mock function calls
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
        const syxMethod = this.rewardMgr.contract.methods.syx().encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            syxMethod,
            abi.rawEncode(["address"], [this.syxMock.address])
        );
        await this.syxMock.givenAnyReturnBool(true);

        const depositTx = await this.wvlxConn.methods["deposit(uint256)"](0, {
            value: depositAmount
        });

        expectEvent(depositTx, "LogDeposit", {
            tokenAmountIn: depositAmount
        });
    });

    it("should withdraw from WVLX connector", async () => {
        const amount = ether("1");
        // Deposit first
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
            amount
        );
        const syxMethod = this.rewardMgr.contract.methods.syx().encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            syxMethod,
            abi.rawEncode(["address"], [this.syxMock.address])
        );
        await this.syxMock.givenAnyReturnBool(true);
        await this.wvlxConn.methods["deposit(uint256)"](0, {
            value: amount
        });

        // Withdraw
        await this.rewardManagerMock.givenMethodReturn(
            userInfoMethod,
            abi.rawEncode(["uint256", "uint256"], [ether("1"), 0])
        );
        const withdrawMethod = this.rewardMgr.contract.methods
            .withdraw(0, 0)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturnUint(withdrawMethod, 0);

        const withdrawTx = await this.wvlxConn.withdraw(amount, 0);

        expectEvent(withdrawTx, "LogWithdrawal", {
            tokenAmountOut: amount
        });
    });
});
