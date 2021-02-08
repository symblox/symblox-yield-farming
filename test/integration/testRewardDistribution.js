const {time} = require("@openzeppelin/test-helpers");
const constants = require("@openzeppelin/test-helpers/src/constants");
const {expectRevert} = require("@openzeppelin/test-helpers");
const {expect, assert} = require("chai");
const abi = require("ethereumjs-abi");
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
    denorm1: "5000000000000000000", //5
    balance1: "5000000000000000000", //5
    denorm2: "5000000000000000000", //5
    balance2: "1000000000000000000", //1
    seedAllocPoint: "0", //0
    swapAllocPoint: "100000000000000000000" //100
};

contract("testRewardDistribution", ([admin, bob]) => {
    before(async () => {
        wToken = await WVLX.new();
        // bfactory = await BFactory.new(wToken.address);
        // const bpoolTx = await bfactory.newBPool();
        // bpool = await BPool.at(bpoolTx.receipt.logs[0].args.pool);
        bpool = await BPool.new();
        symbloxToken = await SymbloxToken.new([]);
        await wToken.deposit({from: admin, value: config.balance1});
        await wToken.approve(bpool.address, config.balance1);
        await bpool.bind(wToken.address, config.balance1, config.denorm1);
        await symbloxToken.mint(admin, config.balance2);
        await symbloxToken.approve(bpool.address, config.balance2);
        await bpool.bind(symbloxToken.address, config.balance2, config.denorm2);
        await bpool.finalize();

        const curBlock = await time.latestBlock();
        rewardPool = await RewardManager.new(
            symbloxToken.address,
            admin,
            curBlock.addn(6),
            curBlock.addn(6),
            "8000000000000000000", //8
            "10"
        );
        await symbloxToken.mint(rewardPool.address, "1000000000000000000000"); //1000
        startBlock = await rewardPool.startBlock();
        endBlock = await rewardPool.endBlock();
        syxPerBlock = await rewardPool.syxPerBlock();
        initSyxSupply = await symbloxToken.totalSupply();
        console.log("startBlock:", startBlock.toString());
        console.log("endBlock:", endBlock.toString());
        console.log("syxPerBlock:", syxPerBlock.toString());
        console.log("initSyxSupply:", initSyxSupply.toString());

        // await symbloxToken.transferOwnership(rewardPool.address);

        //seed pool
        await rewardPool.add(config.seedAllocPoint, wToken.address, false);
        //swap pool
        await rewardPool.add(config.swapAllocPoint, bpool.address, false);

        const wvlxConnector = await WvlxConnector.new();
        const bptConnector = await BptConnector.new();
        connectorFactory = await ConnectorFactory.new(rewardPool.address);
        await connectorFactory.setConnectorImpl("0", wvlxConnector.address);
        await connectorFactory.setConnectorImpl("1", bptConnector.address);

        await connectorFactory.createConnector(
            wToken.address,
            bpool.address,
            "1",
            {
                from: bob
            }
        );
    });

    it("calc reward", async () => {
        const bobConnectorAddress = await connectorFactory.connectors(bob, "1");
        bobConnector = await BptConnector.at(bobConnectorAddress);

        bobBalance = await symbloxToken.balanceOf(bob);
        console.log("bobBalanceStart: ", bobBalance.toString());
        adminBalance = await symbloxToken.balanceOf(admin);
        console.log("adminBalanceStart: ", adminBalance.toString());
        rewardPoolBalance = await symbloxToken.balanceOf(rewardPool.address);
        console.log("rewardPoolBalanceEnd: ", rewardPoolBalance.toString());
        expect(bobBalance).to.be.bignumber.equals("0");
        expect(adminBalance).to.be.bignumber.equals("0");

        const bobStartBlock = await time.latestBlock();
        console.log("bobStartBlock:", bobStartBlock.toString());
        //Reward block from bobStartBlock to endBlock
        await bobConnector.methods["deposit(address,uint256,uint256)"](
            wToken.address,
            "1000000000000000000",
            0,
            {
                from: bob,
                value: "1000000000000000000"
            }
        );

        await time.advanceBlockTo(bobStartBlock.addn(10));
        await bobConnector.getReward({
            from: bob
        });

        curBlock = await time.latestBlock();
        console.log("curBlock:", curBlock.toString());
        bobBalance = await symbloxToken.balanceOf(bob);
        console.log("bobBalanceEnd: ", bobBalance.toString());
        adminBalance = await symbloxToken.balanceOf(admin);
        console.log("adminBalanceEnd: ", adminBalance.toString());
        rewardPoolBalance = await symbloxToken.balanceOf(rewardPool.address);
        console.log("rewardPoolBalanceEnd: ", rewardPoolBalance.toString());
        syxSupply = await symbloxToken.totalSupply();
        console.log("syxSupply: ", syxSupply.toString());

        const rewardBlocks = endBlock.sub(bobStartBlock).sub(new BN(1));
        const userTotalRewards = syxPerBlock.mul(rewardBlocks);
        const devTotalRewards = syxPerBlock.mul(rewardBlocks).div(new BN(9));
        expect(adminBalance).to.be.bignumber.equals(devTotalRewards);

        //Reward block from startBlock to endBlock
        await rewardPool.startNewSeason();
        curBlock = await time.latestBlock();
        console.log("curBlock:", curBlock.toString());
        await time.advanceBlockTo(curBlock.addn(10));
        await bobConnector.getReward({
            from: bob
        });

        bobBalance2 = await symbloxToken.balanceOf(bob);
        console.log("bobBalanceSeason2End: ", bobBalance2.toString());
        adminBalance2 = await symbloxToken.balanceOf(admin);
        console.log("adminBalanceSeason2End: ", adminBalance2.toString());
        rewardPoolBalance2 = await symbloxToken.balanceOf(rewardPool.address);
        console.log(
            "rewardPoolBalanceSeason2End: ",
            rewardPoolBalance2.toString()
        );
        syxSupply2 = await symbloxToken.totalSupply();
        console.log("syxSeason2Supply: ", syxSupply2.toString());

        startBlock = await rewardPool.startBlock();
        endBlock = await rewardPool.endBlock();
        syxPerBlock = await rewardPool.syxPerBlock();

        const rewardBlocks2 = endBlock.sub(startBlock);
        const userTotalRewards2 = syxPerBlock.mul(rewardBlocks2);
        const devTotalRewards2 = syxPerBlock.mul(rewardBlocks2).div(new BN(9));
        expect(adminBalance2.sub(adminBalance)).to.be.bignumber.equals(
            devTotalRewards2
        );
    });
});
