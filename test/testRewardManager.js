const {expectRevert, time} = require("@openzeppelin/test-helpers");
const {expect} = require("chai");
const SymbloxToken = artifacts.require("SymbloxToken");
const RewardManager = artifacts.require("RewardManager");
const MockERC20 = artifacts.require("MockERC20");

contract("RewardManager", ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.symblox = await SymbloxToken.new(
            "0x0000000000000000000000000000000000000000",
            {from: alice}
        );
    });

    it("should set correct state variables", async () => {
        this.rewardMgr = await RewardManager.new(
            this.symblox.address,
            dev,
            "1000",
            "0",
            "1000",
            "1000",
            {from: alice}
        );
        await this.symblox.transferOwnership(this.rewardMgr.address, {
            from: alice
        });
        const syx = await this.rewardMgr.syx();
        const devaddr = await this.rewardMgr.devaddr();
        const owner = await this.symblox.owner();
        assert.equal(syx.valueOf(), this.symblox.address);
        assert.equal(devaddr.valueOf(), dev);
        assert.equal(owner.valueOf(), this.rewardMgr.address);
    });

    it("should allow dev and only dev to update dev", async () => {
        this.rewardMgr = await RewardManager.new(
            this.symblox.address,
            dev,
            "1000",
            "0",
            "1000",
            "1000",
            {from: alice}
        );
        assert.equal((await this.rewardMgr.devaddr()).valueOf(), dev);
        await expectRevert(this.rewardMgr.dev(bob, {from: bob}), "dev: wut?");
        await this.rewardMgr.dev(bob, {from: dev});
        assert.equal((await this.rewardMgr.devaddr()).valueOf(), bob);
        await this.rewardMgr.dev(alice, {from: bob});
        assert.equal((await this.rewardMgr.devaddr()).valueOf(), alice);
    });

    context("With ERC/LP token added to the field", () => {
        beforeEach(async () => {
            this.lp = await MockERC20.new("LPToken", "LP", 18, "10000000000", {
                from: minter
            });
            await this.lp.transfer(alice, "1000", {from: minter});
            await this.lp.transfer(bob, "1000", {from: minter});
            await this.lp.transfer(carol, "1000", {from: minter});
            this.lp2 = await MockERC20.new(
                "LPToken2",
                "LP2",
                18,
                "10000000000",
                {
                    from: minter
                }
            );
            await this.lp2.transfer(alice, "1000", {from: minter});
            await this.lp2.transfer(bob, "1000", {from: minter});
            await this.lp2.transfer(carol, "1000", {from: minter});
        });

        it("should stop giving out rewards after the deadline", async () => {
            const rewardPerBlock = 1000;
            const startBlock = await time.latestBlock();
            const endBlock = startBlock.addn(10);
            const bonusEndBlock = 5;
            this.rewardMgr = await RewardManager.new(
                this.symblox.address,
                dev,
                rewardPerBlock,
                startBlock,
                startBlock.addn(bonusEndBlock),
                endBlock,
                {from: alice}
            );

            await this.symblox.transferOwnership(this.rewardMgr.address, {
                from: alice
            });

            await this.rewardMgr.add("100", this.lp.address, false, {
                from: alice
            });
            await this.lp.approve(this.rewardMgr.address, "1000", {from: bob});
            const depositTx = await this.rewardMgr.deposit(0, "100", {
                from: bob
            });

            const pool = await this.rewardMgr.poolInfo(0);
            expect(pool.lastRewardBlock).to.be.bignumber.equals(
                depositTx.receipt.blockNumber.toString()
            );

            // Jump to the block height that bonus reward finished
            await time.advanceBlockTo(startBlock.addn(6));
            assert.equal(
                (await this.rewardMgr.pendingSyx(0, bob)).valueOf(),
                rewardPerBlock *
                    ((await time.latestBlock()) - depositTx.receipt.blockNumber)
            );

            await time.advanceBlockTo(startBlock.addn(10));
            assert.equal(
                (await this.rewardMgr.pendingSyx(0, bob)).valueOf(),
                rewardPerBlock *
                    ((await time.latestBlock()) - depositTx.receipt.blockNumber)
            );

            await time.advanceBlockTo(startBlock.addn(100));
            assert.equal(
                (await this.rewardMgr.pendingSyx(0, bob)).valueOf(),
                rewardPerBlock * (endBlock - depositTx.receipt.blockNumber)
            );
        });

        it("should allow emergency withdraw", async () => {
            // 100 per block farming rate starting at block 100 with bonus until block 1000
            this.rewardMgr = await RewardManager.new(
                this.symblox.address,
                dev,
                "100",
                "100",
                "1000",
                "1000",
                {from: alice}
            );
            await this.rewardMgr.add("100", this.lp.address, true);
            await this.lp.approve(this.rewardMgr.address, "1000", {from: bob});
            await this.rewardMgr.deposit(0, "100", {from: bob});
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), "900");
            await this.rewardMgr.emergencyWithdraw(0, {from: bob});
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), "1000");
        });

        it("should give out Symblox only after farming time", async () => {
            const currBlock = await time.latestBlock();
            // 100 per block farming rate starting at block 100 with bonus until block 1000
            this.rewardMgr = await RewardManager.new(
                this.symblox.address,
                dev,
                "100",
                currBlock.addn(100),
                currBlock.addn(1000),
                "100000",
                {from: alice}
            );
            await this.symblox.transferOwnership(this.rewardMgr.address, {
                from: alice
            });
            await this.rewardMgr.add("100", this.lp.address, true);
            await this.lp.approve(this.rewardMgr.address, "1000", {from: bob});
            await this.rewardMgr.deposit(0, "100", {from: bob});
            await time.advanceBlockTo(currBlock.addn(89));
            await this.rewardMgr.deposit(0, "0", {from: bob}); // block 90
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "0");
            await time.advanceBlockTo(currBlock.addn(94));
            await this.rewardMgr.deposit(0, "0", {from: bob}); // block 95
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "0");
            await time.advanceBlockTo(currBlock.addn(99));
            await this.rewardMgr.deposit(0, "0", {from: bob}); // block 100
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "0");
            await time.advanceBlockTo(currBlock.addn(100));
            await this.rewardMgr.deposit(0, "0", {from: bob}); // block 101
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "300");
            await time.advanceBlockTo(currBlock.addn(104));
            await this.rewardMgr.deposit(0, "0", {from: bob}); // block 105
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "1500");
            assert.equal((await this.symblox.balanceOf(dev)).valueOf(), "150");
            assert.equal((await this.symblox.totalSupply()).valueOf(), "1650");
        });

        it("should not distribute Symblox if no one deposit", async () => {
            const currBlock = await time.latestBlock();
            // 100 per block farming rate starting at block 200 with bonus until block 1000
            this.rewardMgr = await RewardManager.new(
                this.symblox.address,
                dev,
                "100",
                currBlock.addn(200),
                currBlock.addn(1000),
                currBlock.addn(2000),
                {from: alice}
            );
            await this.symblox.transferOwnership(this.rewardMgr.address, {
                from: alice
            });
            await this.rewardMgr.add("100", this.lp.address, true);
            await this.lp.approve(this.rewardMgr.address, "1000", {from: bob});
            await time.advanceBlockTo(currBlock.addn(199));
            assert.equal((await this.symblox.totalSupply()).valueOf(), "0");
            await time.advanceBlockTo(currBlock.addn(204));
            assert.equal((await this.symblox.totalSupply()).valueOf(), "0");
            await time.advanceBlockTo(currBlock.addn(209));
            await this.rewardMgr.deposit(0, "10", {from: bob}); // block 210
            assert.equal((await this.symblox.totalSupply()).valueOf(), "0");
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "0");
            assert.equal((await this.symblox.balanceOf(dev)).valueOf(), "0");
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), "990");
            await time.advanceBlockTo(currBlock.addn(219));
            await this.rewardMgr.withdraw(0, "10", {from: bob}); // block 220
            assert.equal((await this.symblox.totalSupply()).valueOf(), "3300");
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "3000");
            assert.equal((await this.symblox.balanceOf(dev)).valueOf(), "300");
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), "1000");
        });

        it("should distribute Symblox properly for each staker", async () => {
            const currBlock = await time.latestBlock();
            // 100 per block farming rate starting at block 300 with bonus until block 1000
            this.rewardMgr = await RewardManager.new(
                this.symblox.address,
                dev,
                "100",
                currBlock.addn(300),
                currBlock.addn(1000),
                "100000",
                {from: alice}
            );
            await this.symblox.transferOwnership(this.rewardMgr.address, {
                from: alice
            });
            await this.rewardMgr.add("100", this.lp.address, true);
            await this.lp.approve(this.rewardMgr.address, "1000", {
                from: alice
            });
            await this.lp.approve(this.rewardMgr.address, "1000", {from: bob});
            await this.lp.approve(this.rewardMgr.address, "1000", {
                from: carol
            });
            // Alice deposits 10 LPs at block 310
            await time.advanceBlockTo(currBlock.addn(309));
            await this.rewardMgr.deposit(0, "10", {from: alice});
            // Bob deposits 20 LPs at block 314
            await time.advanceBlockTo(currBlock.addn(313));
            await this.rewardMgr.deposit(0, "20", {from: bob});
            // Carol deposits 30 LPs at block 318
            await time.advanceBlockTo(currBlock.addn(317));
            await this.rewardMgr.deposit(0, "30", {from: carol});
            // Alice deposits 10 more LPs at block 320. At this point:
            //   Alice should have: 4*1000 + 4*1/3*1000 + 2*1/6*1000 = 5666
            //   RewardManager should have the remaining: 10000 - 5666 = 4334
            await time.advanceBlockTo(currBlock.addn(319));
            await this.rewardMgr.deposit(0, "10", {from: alice});
            assert.equal((await this.symblox.totalSupply()).valueOf(), "3300");
            assert.equal(
                (await this.symblox.balanceOf(alice)).valueOf(),
                "1700"
            );
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "0");
            assert.equal((await this.symblox.balanceOf(carol)).valueOf(), "0");
            assert.equal(
                (
                    await this.symblox.balanceOf(this.rewardMgr.address)
                ).valueOf(),
                "1300"
            );
            assert.equal((await this.symblox.balanceOf(dev)).valueOf(), "300");
            // Bob withdraws 5 LPs at block 330. At this point:
            //   Bob should have: 4*2/3*300 + 2*2/6*300 + 10*2/7*300 = 1857
            await time.advanceBlockTo(currBlock.addn(329));
            await this.rewardMgr.withdraw(0, "5", {from: bob});
            assert.equal((await this.symblox.totalSupply()).valueOf(), "6600");
            assert.equal(
                (await this.symblox.balanceOf(alice)).valueOf(),
                "1700"
            );
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "1857");
            assert.equal((await this.symblox.balanceOf(carol)).valueOf(), "0");
            assert.equal(
                (
                    await this.symblox.balanceOf(this.rewardMgr.address)
                ).valueOf(),
                "2443"
            );
            assert.equal((await this.symblox.balanceOf(dev)).valueOf(), "600");
            // Alice withdraws 20 LPs at block 340.
            // Bob withdraws 15 LPs at block 350.
            // Carol withdraws 30 LPs at block 360.
            await time.advanceBlockTo(currBlock.addn(339));
            await this.rewardMgr.withdraw(0, "20", {from: alice});
            await time.advanceBlockTo(currBlock.addn(349));
            await this.rewardMgr.withdraw(0, "15", {from: bob});
            await time.advanceBlockTo(currBlock.addn(359));
            await this.rewardMgr.withdraw(0, "30", {from: carol});
            assert.equal((await this.symblox.totalSupply()).valueOf(), "16500");
            assert.equal((await this.symblox.balanceOf(dev)).valueOf(), "1500");
            // Alice should have: 1700 + 3*2/7*1000 + 3*2/6.5*1000 = 3480
            assert.equal(
                (await this.symblox.balanceOf(alice)).valueOf(),
                "3480"
            );
            // Bob should have: 1857 + 3*1.5/6.5 * 1000 + 3*1.5/4.5*1000 = 3550
            assert.equal((await this.symblox.balanceOf(bob)).valueOf(), "3550");
            // Carol should have: 2*3/6*300 + 3*3/7*1000 + 3*3/6.5*1000 + 3*3/4.5*1000 + 3*1000 = 7970
            assert.equal(
                (await this.symblox.balanceOf(carol)).valueOf(),
                "7970"
            );
            // All of them should have 1000 LPs back.
            assert.equal((await this.lp.balanceOf(alice)).valueOf(), "1000");
            assert.equal((await this.lp.balanceOf(bob)).valueOf(), "1000");
            assert.equal((await this.lp.balanceOf(carol)).valueOf(), "1000");
        });

        it("should give proper Symblox allocation to each pool", async () => {
            const currBlock = await time.latestBlock();
            // 100 per block farming rate starting at block 400 with bonus until block 1000
            this.rewardMgr = await RewardManager.new(
                this.symblox.address,
                dev,
                "100",
                currBlock.addn(400),
                currBlock.addn(1000),
                currBlock.addn(2000),
                {from: alice}
            );
            await this.symblox.transferOwnership(this.rewardMgr.address, {
                from: alice
            });
            await this.lp.approve(this.rewardMgr.address, "1000", {
                from: alice
            });
            await this.lp2.approve(this.rewardMgr.address, "1000", {from: bob});
            // Add first LP to the pool with allocation 1
            await this.rewardMgr.add("10", this.lp.address, true);
            // Alice deposits 10 LPs at block 410
            await time.advanceBlockTo(currBlock.addn(409));
            await this.rewardMgr.deposit(0, "10", {from: alice});
            // Add LP2 to the pool with allocation 2 at block 420
            await time.advanceBlockTo(currBlock.addn(419));
            await this.rewardMgr.add("20", this.lp2.address, true);
            // Alice should have 10*300 pending reward
            assert.equal(
                (await this.rewardMgr.pendingSyx(0, alice)).valueOf(),
                "3000"
            );
            // Bob deposits 10 LP2s at block 425
            await time.advanceBlockTo(currBlock.addn(424));
            await this.rewardMgr.deposit(1, "5", {from: bob});
            // Alice should have 3000 + 5*100 = 3500 pending reward
            assert.equal(
                (await this.rewardMgr.pendingSyx(0, alice)).valueOf(),
                "3500"
            );
            await time.advanceBlockTo(currBlock.addn(430));
            // At block 430. Bob should get 1000. Alice should get ~4000 more.
            assert.equal(
                (await this.rewardMgr.pendingSyx(0, alice)).valueOf(),
                "4000"
            );
            assert.equal(
                (await this.rewardMgr.pendingSyx(1, bob)).valueOf(),
                "1000"
            );
        });

        it("should stop giving bonus Symblox after the bonus period ends", async () => {
            const currBlock = await time.latestBlock();
            // 100 per block farming rate starting at block 500 with bonus until block 600
            this.rewardMgr = await RewardManager.new(
                this.symblox.address,
                dev,
                "100",
                currBlock.addn(500),
                currBlock.addn(600),
                "100000",
                {from: alice}
            );
            await this.symblox.transferOwnership(this.rewardMgr.address, {
                from: alice
            });
            await this.lp.approve(this.rewardMgr.address, "1000", {
                from: alice
            });
            await this.rewardMgr.add("1", this.lp.address, true);
            // Alice deposits 10 LPs at block 590
            await time.advanceBlockTo(currBlock.addn(589));
            await this.rewardMgr.deposit(0, "10", {from: alice});
            // At block 605, she should have 1000*3 + 100*5 = 3500 pending.
            await time.advanceBlockTo(currBlock.addn(605));
            assert.equal(
                (await this.rewardMgr.pendingSyx(0, alice)).valueOf(),
                "3500"
            );
            // At block 606, Alice withdraws all pending rewards and should get 3600.
            await this.rewardMgr.deposit(0, "0", {from: alice});
            assert.equal(
                (await this.rewardMgr.pendingSyx(0, alice)).valueOf(),
                "0"
            );
            assert.equal(
                (await this.symblox.balanceOf(alice)).valueOf(),
                "3600"
            );
        });
    });
});
