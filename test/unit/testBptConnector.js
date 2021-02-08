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
        this.syxMock = await MockContract.new();
        this.wvlxMock = await MockERC20.new(
            "Wvlx",
            "WVLX",
            18,
            ether("100000")
        );
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
            this.wvlxMock.address,
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
            this.wvlxMock.address,
            lpTokenMock.address,
            poolId
        );
        expectEvent(initTx, "LogInit", {
            owner: alice,
            rewardManager: rewardManagerMock.address,
            lpToken: lpTokenMock.address
        });
    });
    it("should get balance of lpToken", async () => {
        const balance = ether("1");

        const userInfoMethod = this.rewardMgr.contract.methods
            .userInfo(0, constants.ZERO_ADDRESS)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            userInfoMethod,
            abi.rawEncode(["uint256", "uint256"], [balance, 0])
        );
        const bal = await this.bptConn.balanceOfLpToken();
        expect(bal).to.be.bignumber.equals(balance);
    });
    it("should see the claimable reward amount", async () => {
        const rewardAmount = ether("1");
        // Mock function calls
        const pendingSyxMethod = this.rewardMgr.contract.methods
            .pendingSyx(0, constants.ZERO_ADDRESS)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturnUint(
            pendingSyxMethod,
            rewardAmount
        );
        const reward = await this.bptConn.earned();
        expect(reward).to.be.bignumber.equals(rewardAmount);
    });
    it("should get rewards", async () => {
        const rewardAmount = ether("1");
        symbloxMock = await MockERC20.new("Symblox", "SYX", 18, rewardAmount);

        const getSyxMethod = this.rewardMgr.contract.methods.syx().encodeABI();
        await this.rewardManagerMock.givenMethodReturnUint(
            getSyxMethod,
            symbloxMock.address
        );
        const getRewardMethod = this.rewardMgr.contract.methods
            .getReward(0)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturnUint(
            getRewardMethod,
            rewardAmount
        );

        await symbloxMock.transfer(this.bptConn.address, rewardAmount);

        const getRewardTx = await this.bptConn.getReward();

        expectEvent(getRewardTx, "LogReward", {
            amount: rewardAmount
        });
    });
    it("should deposit erc20 token to BptConnector", async () => {
        const depositAmount = ether("1");
        // Mock function calls
        symbloxMock = await MockERC20.new("Symblox", "SYX", 18, depositAmount);
        await symbloxMock.approve(this.bptConn.address, depositAmount);

        const syxMethod = this.rewardMgr.contract.methods.syx().encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            syxMethod,
            abi.rawEncode(["address"], [symbloxMock.address])
        );

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
            tokenAmountIn: depositAmount
        });
    });
    it("should deposit native token to BptConnector", async () => {
        const depositAmount = ether("1");
        // Mock function calls
        const joinSwapMethod = this.bpool.contract.methods
            .joinswapExternAmountIn(this.wvlxMock.address, 0, 0)
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
        const syxMethod = this.rewardMgr.contract.methods.syx().encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            syxMethod,
            abi.rawEncode(["address"], [this.syxMock.address])
        );
        await this.syxMock.givenAnyReturnBool(true);
        const depositMethod = this.rewardMgr.contract.methods
            .deposit(0, 0)
            .encodeABI();
        await this.rewardManagerMock.givenMethodReturnUint(
            depositMethod,
            depositAmount
        );

        const depositTx = await this.bptConn.methods[
            "deposit(address,uint256,uint256)"
        ](this.wvlxMock.address, depositAmount, 0, {
            value: depositAmount
        });

        expectEvent(depositTx, "LogDeposit", {
            tokenAmountIn: depositAmount
        });
    });
    it("should withdraw erc20 token from BptConnector", async () => {
        const amount = ether("1");
        symbloxMock = await MockERC20.new("Symblox", "SYX", 18, amount);
        await symbloxMock.transfer(this.bptConn.address, amount);

        // Mock function calls
        const syxMethod = this.rewardMgr.contract.methods.syx().encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            syxMethod,
            abi.rawEncode(["address"], [this.syxMock.address])
        );
        await this.syxMock.givenAnyReturnBool(true);
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
            tokenAmountOut: amount
        });
    });
    it("should withdraw native token from BptConnector", async () => {
        const amount = ether("1");
        symbloxMock = await MockERC20.new("Symblox", "SYX", 18, amount);
        // Mock function calls
        const syxMethod = this.rewardMgr.contract.methods.syx().encodeABI();
        await this.rewardManagerMock.givenMethodReturn(
            syxMethod,
            abi.rawEncode(["address"], [symbloxMock.address])
        );
        const exitSwapMethod = this.bpool.contract.methods
            .exitswapExternAmountOut(this.wvlxMock.address, 0, 0)
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

        // Needs to send withdraw amout of native tokens to the connector first
        await web3.eth.sendTransaction({
            from: alice,
            to: this.bptConn.address,
            value: amount
        });

        const withdrawTx = await this.bptConn.withdraw(
            this.wvlxMock.address,
            amount,
            0
        );

        expectEvent(withdrawTx, "LogWithdrawal", {
            tokenAmountOut: amount
        });
    });
});
