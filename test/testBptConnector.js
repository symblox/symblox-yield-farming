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
const MockERC20 = artifacts.require("MockERC20");

contract("BptConnector", ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.tokenMock = await MockContract.new();

        // RewardManager Mock
        this.rewardManagerMock = await MockContract.new();
        this.rewardMgr = await RewardManager.at(this.rewardManagerMock.address);
        // BPool Mock
        this.bpoolMock = await MockContract.new();
        this.bpool = await BPool.at(this.bpoolMock.address);
        await this.bpoolMock.givenAnyReturnBool(true);

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
    it("should deposit erc20 token to BptConnector", async () => {
        const depositAmount = ether("1");
        // Mock function calls
        symbloxMock = await MockERC20.new("Symblox", "SYX", 18, depositAmount);
        await symbloxMock.approve(this.bptConn.address, depositAmount);
        const joinSwapMethod = this.bpool.contract.methods
            .joinswapExternAmountIn(constants.ZERO_ADDRESS, 0, 0)
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

        const depositTx = await this.bptConn.deposit(
            symbloxMock.address,
            depositAmount,
            0
        );

        expectEvent(depositTx, "LogDeposit", {
            amount: depositAmount
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
    it("should withdraw erc20 token from BptConnector", async () => {
        const amount = ether("1");
        symbloxMock = await MockERC20.new("Symblox", "SYX", 18, amount);
        await symbloxMock.transfer(this.bptConn.address, amount);

        // Mock function calls
        const exitSwapMethod = this.bpool.contract.methods
            .exitswapPoolAmountIn(constants.ZERO_ADDRESS, 0, 0)
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

        const withdrawTx = await this.bptConn.withdraw(
            symbloxMock.address,
            amount,
            0
        );
        expectEvent(withdrawTx, "LogWithdrawal", {
            amount: amount
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

        // Revert if no tokens in the connector
        const withdrawFailTx = this.bptConn.withdraw(amount, 0);
        await expectRevert(withdrawFailTx, "ERR_BAL_INSUFFICIENT");

        // Needs to send withdraw amout of native tokens to the connector first
        await web3.eth.sendTransaction({
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
