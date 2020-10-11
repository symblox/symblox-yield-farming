const {time} = require("@openzeppelin/test-helpers");
const constants = require("@openzeppelin/test-helpers/src/constants");
const {expect, assert} = require("chai");
const BN = require("bn.js");
const BptConnector = artifacts.require("BptConnector");
const WvlxConnector = artifacts.require("WvlxConnector");
const ConnectorFactory = artifacts.require("ConnectorFactory");
const BFactory = artifacts.require("BFactory");
const WVLX = artifacts.require("WVLX");
const BPool = artifacts.require("BPool");
const RewardManager = artifacts.require("RewardManager");
const SymbloxToken = artifacts.require("SymbloxToken");

const config = {
    syxPerBlock: "1000000000000000000", //1
    startBlock: "1",
    bonusEndBlock: "1",
    endBlock: "100000",
    denorm1: "5000000000000000000", //5
    balance1: "50000000000000000000", //50
    denorm2: "5000000000000000000", //5
    balance2: "10000000000000000000", //10
    seedAllocPoint: "15000000000000000000", //15
    swapAllocPoint: "85000000000000000000" //85
};

const almostEqualDiv1e12 = function (expectedOrig, actualOrig) {
    const _1e12 = new BN("10").pow(new BN("12"));
    const expected = expectedOrig.div(_1e12);
    const actual = actualOrig.div(_1e12);
    this.assert(
        expected.eq(actual) ||
            expected.addn(1).eq(actual) ||
            expected.addn(2).eq(actual) ||
            actual.addn(1).eq(expected) ||
            actual.addn(2).eq(expected),
        "expected #{act} to be almost equal #{exp}",
        "expected #{act} to be different from #{exp}",
        expectedOrig.toString(),
        actualOrig.toString()
    );
};

let bfactory, bpool, wToken, symbloxToken, rewardPool, connectorFactory;
contract("Integration test", ([admin, alice, bob]) => {
    before(async () => {
        wToken = await WVLX.new();
        bfactory = await BFactory.new(wToken.address);
        const bpoolTx = await bfactory.newBPool();
        bpool = await BPool.at(bpoolTx.receipt.logs[0].args.pool);
        symbloxToken = await SymbloxToken.new(constants.ZERO_ADDRESS);
        rewardPool = await RewardManager.new(
            symbloxToken.address,
            admin,
            config.syxPerBlock,
            config.startBlock,
            config.bonusEndBlock,
            config.endBlock
        );

        await wToken.deposit({from: admin, value: config.balance1});
        await wToken.approve(bpool.address, config.balance1);
        await bpool.bind(wToken.address, config.balance1, config.denorm1);
        await symbloxToken.mint(admin, config.balance2);
        await symbloxToken.approve(bpool.address, config.balance2);
        await bpool.bind(symbloxToken.address, config.balance2, config.denorm2);
        await bpool.finalize();

        await symbloxToken.transferOwnership(rewardPool.address);

        //seed pool
        await rewardPool.add(config.seedAllocPoint, wToken.address, false);
        //swap pool
        await rewardPool.add(config.swapAllocPoint, bpool.address, false);

        const wvlxConnector = await WvlxConnector.new();
        const bptConnector = await BptConnector.new();
        connectorFactory = await ConnectorFactory.new(rewardPool.address);
        await connectorFactory.setConnectorImpl("0", wvlxConnector.address);
        await connectorFactory.setConnectorImpl("1", bptConnector.address);
    });

    context("seed pool", () => {
        let aliceConnector,
            bobConnector,
            seedPoolPerBlockReward,
            alicePerBlockReward,
            bobPerBlockReward;
        before(async () => {
            await connectorFactory.createConnector(wToken.address, "0", {
                from: alice
            });

            await connectorFactory.createConnector(wToken.address, "0", {
                from: bob
            });

            const aliceConnectorAddress = await connectorFactory.connectors(
                alice,
                "0"
            );
            const bobConnectorAddress = await connectorFactory.connectors(
                bob,
                "0"
            );
            aliceConnector = await WvlxConnector.at(aliceConnectorAddress);
            bobConnector = await WvlxConnector.at(bobConnectorAddress);

            seedPoolPerBlockReward = parseFloat(config.syxPerBlock) * 0.15;
            alicePerBlockReward = (seedPoolPerBlockReward * 2) / 3;
            bobPerBlockReward = (seedPoolPerBlockReward * 1) / 3;
        });

        it("deposit and check reward", async () => {
            const aliceDepositAmount = "10000000000000000000";
            const bobDepositAmount = "5000000000000000000";

            //alice deposit 10 vlx
            await aliceConnector.methods["deposit(uint256)"](0, {
                from: alice,
                value: aliceDepositAmount
            });
            const aliceStartBlock = await time.latestBlock();
            //bob deposit 5 vlx
            await bobConnector.methods["deposit(uint256)"](0, {
                from: bob,
                value: bobDepositAmount
            });
            const bobStartBlock = await time.latestBlock();

            let aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.be.bignumber.equal(aliceDepositAmount);
            let bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.be.bignumber.equal(bobDepositAmount);

            await time.advanceBlockTo(bobStartBlock.addn(1));
            const endBlock = await time.latestBlock();

            let aliceReward = await aliceConnector.earned();
            //Before bob deposit, alice accounted for 100%
            expect(aliceReward).to.be.bignumber.equal(
                (
                    seedPoolPerBlockReward * (bobStartBlock - aliceStartBlock) +
                    (endBlock - bobStartBlock) * alicePerBlockReward
                ).toString()
            );
            let bobReward = await bobConnector.earned();
            expect(bobReward).to.be.bignumber.equal(
                ((endBlock - bobStartBlock) * bobPerBlockReward).toString()
            );
        });

        it("get reward", async () => {
            let aliceSyxStart = await symbloxToken.balanceOf(alice);
            let aliceReward = await aliceConnector.earned();
            await aliceConnector.getReward({from: alice});
            let aliceSyxEnd = await symbloxToken.balanceOf(alice);
            //getReward has passed 1 block, so add alicePerBlockReward
            expect(aliceSyxEnd).to.be.bignumber.equal(
                (
                    parseFloat(aliceSyxStart) +
                    parseFloat(aliceReward) +
                    parseFloat(alicePerBlockReward)
                ).toString()
            );
            aliceReward = await aliceConnector.earned();
            expect(aliceReward).to.be.bignumber.equal("0");

            let bobSyxStart = await symbloxToken.balanceOf(bob);
            let bobReward = await bobConnector.earned();
            await bobConnector.getReward({from: bob});
            let bobSyxEnd = await symbloxToken.balanceOf(bob);
            //getReward has passed 1 block, so add bobPerBlockReward
            expect(bobSyxEnd).to.be.bignumber.equal(
                (
                    parseFloat(bobSyxStart) +
                    parseFloat(bobReward) +
                    parseFloat(bobPerBlockReward)
                ).toString()
            );
            bobReward = await bobConnector.earned();
            expect(bobReward).to.be.bignumber.equal("0");
        });

        it("withdraw", async () => {
            let aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.not.be.bignumber.equal("0");
            await aliceConnector.withdraw(aliceAmount, "0", {from: alice});
            aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.be.bignumber.equal("0");
            let aliceReward = await aliceConnector.earned();
            expect(aliceReward).to.be.bignumber.equal("0");

            let bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.not.be.bignumber.equal("0");
            await bobConnector.withdraw(bobAmount, "0", {from: bob});
            bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.be.bignumber.equal("0");
            let bobReward = await bobConnector.earned();
            expect(bobReward).to.be.bignumber.equal("0");
        });
    });

    context("swap pool", () => {
        let aliceConnector,
            bobConnector,
            swapPoolPerBlockReward,
            alicePerBlockReward,
            bobPerBlockReward;
        before(async () => {
            await connectorFactory.createConnector(bpool.address, "1", {
                from: alice
            });

            await connectorFactory.createConnector(bpool.address, "1", {
                from: bob
            });

            const aliceConnectorAddress = await connectorFactory.connectors(
                alice,
                "1"
            );
            const bobConnectorAddress = await connectorFactory.connectors(
                bob,
                "1"
            );
            aliceConnector = await BptConnector.at(aliceConnectorAddress);
            bobConnector = await BptConnector.at(bobConnectorAddress);

            swapPoolPerBlockReward = parseFloat(config.syxPerBlock) * 0.85;
        });

        it("deposit vlx and check reward", async () => {
            const aliceDepositAmount = "10000000000000000000";
            const bobDepositAmount = "5000000000000000000";

            //alice deposit 10 vlx
            await aliceConnector.methods["deposit(uint256)"](0, {
                from: alice,
                value: aliceDepositAmount
            });
            const aliceStartBlock = await time.latestBlock();
            //bob deposit 5 vlx
            await bobConnector.methods["deposit(uint256)"](0, {
                from: bob,
                value: bobDepositAmount
            });
            const bobStartBlock = await time.latestBlock();

            let aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.not.be.bignumber.equal("0");
            let bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.not.be.bignumber.equal("0");
            let totalSupply = await bpool.balanceOf(rewardPool.address);
            expect(totalSupply).to.not.be.bignumber.equal("0");

            alicePerBlockReward =
                (swapPoolPerBlockReward * aliceAmount) / totalSupply;
            bobPerBlockReward =
                (swapPoolPerBlockReward * bobAmount) / totalSupply;

            await time.advanceBlockTo(bobStartBlock.addn(1));
            const endBlock = await time.latestBlock();

            let aliceReward = await aliceConnector.earned();
            //Before bob deposit, alice accounted for 100%
            almostEqualDiv1e12(
                aliceReward,
                new BN(
                    (
                        swapPoolPerBlockReward *
                            (bobStartBlock - aliceStartBlock) +
                        (endBlock - bobStartBlock) * alicePerBlockReward
                    ).toString()
                )
            );
            let bobReward = await bobConnector.earned();
            almostEqualDiv1e12(
                bobReward,
                new BN(
                    ((endBlock - bobStartBlock) * bobPerBlockReward).toString()
                )
            );
        });

        it("get reward", async () => {
            let aliceSyxStart = await symbloxToken.balanceOf(alice);
            let aliceReward = await aliceConnector.earned();
            await aliceConnector.getReward({from: alice});
            let aliceSyxEnd = await symbloxToken.balanceOf(alice);
            //getReward has passed 1 block, so add alicePerBlockReward
            almostEqualDiv1e12(
                aliceSyxEnd,
                new BN(
                    (
                        parseFloat(aliceSyxStart) +
                        parseFloat(aliceReward) +
                        parseFloat(alicePerBlockReward)
                    ).toString()
                )
            );
            aliceReward = await aliceConnector.earned();
            expect(aliceReward).to.be.bignumber.equal("0");

            let bobSyxStart = await symbloxToken.balanceOf(bob);
            let bobReward = await bobConnector.earned();
            await bobConnector.getReward({from: bob});
            let bobSyxEnd = await symbloxToken.balanceOf(bob);
            //getReward has passed 1 block, so add bobPerBlockReward
            almostEqualDiv1e12(
                bobSyxEnd,
                new BN(
                    (
                        parseFloat(bobSyxStart) +
                        parseFloat(bobReward) +
                        parseFloat(bobPerBlockReward)
                    ).toString()
                )
            );
            bobReward = await bobConnector.earned();
            expect(bobReward).to.be.bignumber.equal("0");
        });

        it("withdraw vlx", async () => {
            let aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.not.be.bignumber.equal("0");
            await aliceConnector.withdraw(aliceAmount, "0", {from: alice});
            aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.be.bignumber.equal("0");
            let aliceReward = await aliceConnector.earned();
            expect(aliceReward).to.be.bignumber.equal("0");

            let bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.not.be.bignumber.equal("0");
            await bobConnector.withdraw(bobAmount, "0", {from: bob});
            bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.be.bignumber.equal("0");
            let bobReward = await bobConnector.earned();
            expect(bobReward).to.be.bignumber.equal("0");
        });

        it("deposit syx and check reward", async () => {
            const aliceDepositAmount = await symbloxToken.balanceOf(alice);
            const bobDepositAmount = await symbloxToken.balanceOf(bob);

            await symbloxToken.approve(
                aliceConnector.address,
                aliceDepositAmount,
                {
                    from: alice
                }
            );
            await aliceConnector.methods["deposit(address,uint256,uint256)"](
                symbloxToken.address,
                aliceDepositAmount,
                0,
                {
                    from: alice
                }
            );
            const aliceStartBlock = await time.latestBlock();

            await symbloxToken.approve(bobConnector.address, bobDepositAmount, {
                from: bob
            });
            await bobConnector.methods["deposit(address,uint256,uint256)"](
                symbloxToken.address,
                bobDepositAmount,
                0,
                {
                    from: bob
                }
            );
            const bobStartBlock = await time.latestBlock();

            let aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.not.be.bignumber.equal("0");
            let bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.not.be.bignumber.equal("0");
            let totalSupply = await bpool.balanceOf(rewardPool.address);
            expect(totalSupply).to.not.be.bignumber.equal("0");

            alicePerBlockReward =
                (swapPoolPerBlockReward * aliceAmount) / totalSupply;
            bobPerBlockReward =
                (swapPoolPerBlockReward * bobAmount) / totalSupply;

            await time.advanceBlockTo(bobStartBlock.addn(1));
            const endBlock = await time.latestBlock();

            let aliceReward = await aliceConnector.earned();
            //Before bob deposit, alice accounted for 100%
            almostEqualDiv1e12(
                aliceReward,
                new BN(
                    (
                        swapPoolPerBlockReward *
                            (bobStartBlock - aliceStartBlock) +
                        (endBlock - bobStartBlock) * alicePerBlockReward
                    ).toString()
                )
            );
            let bobReward = await bobConnector.earned();
            almostEqualDiv1e12(
                bobReward,
                new BN(
                    ((endBlock - bobStartBlock) * bobPerBlockReward).toString()
                )
            );
        });

        it("withdraw syx", async () => {
            let aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.not.be.bignumber.equal("0");
            await aliceConnector.methods[
                "withdraw(address,uint256,uint256)"
            ](symbloxToken.address, aliceAmount, "0", {from: alice});
            aliceAmount = await aliceConnector.balanceOfLpToken();
            expect(aliceAmount).to.be.bignumber.equal("0");
            let aliceReward = await aliceConnector.earned();
            expect(aliceReward).to.be.bignumber.equal("0");

            let bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.not.be.bignumber.equal("0");
            await bobConnector.methods["withdraw(address,uint256,uint256)"](
                symbloxToken.address,
                bobAmount,
                "0",
                {
                    from: bob
                }
            );
            bobAmount = await bobConnector.balanceOfLpToken();
            expect(bobAmount).to.be.bignumber.equal("0");
            let bobReward = await bobConnector.earned();
            expect(bobReward).to.be.bignumber.equal("0");
        });

        it("buy syx", async () => {
            let balanceStart = await symbloxToken.balanceOf(bob);
            await bpool.swapWTokenAmountIn(
                symbloxToken.address,
                "0",
                "10000000000000000000",
                {
                    value: "5000000000000000000", //5
                    from: bob
                }
            );
            balanceEnd = await symbloxToken.balanceOf(bob);
            assert.isAbove(
                parseFloat(balanceEnd.toString()),
                parseFloat(balanceStart.toString())
            );
        });

        it("buy vlx", async () => {
            let balanceStart = await symbloxToken.balanceOf(bob);
            await symbloxToken.approve(bpool.address, "1000000000000000000", {
                from: bob
            });
            await bpool.swapExactAmountInWTokenOut(
                symbloxToken.address,
                "1000000000000000000", //1
                "0",
                "10000000000000000000",
                {
                    from: bob
                }
            );
            balanceEnd = await symbloxToken.balanceOf(bob);
            assert.isBelow(
                parseFloat(balanceEnd.toString()),
                parseFloat(balanceStart.toString())
            );
        });
    });
});
