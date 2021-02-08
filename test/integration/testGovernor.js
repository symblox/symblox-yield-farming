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
const Governor = artifacts.require("MockGovernor");
const Timelock = artifacts.require("Timelock");

const config = {
    syxPerBlock: "1000000000000000000", //1
    startBlock: "1",
    bonusEndBlock: "1",
    seasonBlocks: "10",
    initSupply: "8000000000000000000", //8 syx
    denorm1: "5000000000000000000", //5
    balance1: "5000000000000000000", //5
    denorm2: "5000000000000000000", //5
    balance2: "1000000000000000000", //1
    seedAllocPoint: "15000000000000000000", //15
    swapAllocPoint: "85000000000000000000" //85
};

let bfactory,
    bpool,
    wToken,
    symbloxToken,
    rewardPool,
    connectorFactory,
    timelock,
    governor;
contract("Governor", ([admin, alice, bob]) => {
    before(async () => {
        wToken = await WVLX.new();
        bfactory = await BFactory.new(wToken.address);
        const bpoolTx = await bfactory.newBPool();
        bpool = await BPool.at(bpoolTx.receipt.logs[0].args.pool);
        symbloxToken = await SymbloxToken.new([]);
        rewardPool = await RewardManager.new(
            symbloxToken.address,
            admin,
            config.startBlock,
            config.bonusEndBlock,
            config.initSupply,
            config.seasonBlocks
        );
        timelock = await Timelock.new(admin, 604800); //1 week
        governor = await Governor.new(
            timelock.address,
            symbloxToken.address,
            admin
        );

        await wToken.deposit({from: admin, value: config.balance1});
        await wToken.approve(bpool.address, config.balance1);
        await bpool.bind(wToken.address, config.balance1, config.denorm1);
        await symbloxToken.mint(admin, config.balance2);
        await symbloxToken.approve(bpool.address, config.balance2);
        await bpool.bind(symbloxToken.address, config.balance2, config.denorm2);
        await bpool.finalize();

        await symbloxToken.mint(admin, "100000000000000000000"); //100
        await symbloxToken.mint(alice, "100000000000000000000"); //100
        await symbloxToken.mint(bob, "100000000000000000000"); //100

        await symbloxToken.transferOwnership(rewardPool.address);

        //seed pool
        await rewardPool.add(config.seedAllocPoint, wToken.address, false);
        //swap pool
        await rewardPool.add(config.swapAllocPoint, bpool.address, false);

        const wvlxConnector = await WvlxConnector.new();

        connectorFactory = await ConnectorFactory.new(rewardPool.address);
        await connectorFactory.setConnectorImpl("0", wvlxConnector.address);
        // let res = await connectorFactory.owner();
        // console.log(res.toString())
        await connectorFactory.transferOwnership(timelock.address);
        // res = await connectorFactory.owner();
        // console.log(res.toString())
        await rewardPool.transferOwnership(timelock.address);
        await bpool.setController(timelock.address);

        //change timelock admin to governor address
        const timestamp = await time.latest();
        const delay = await timelock.delay();
        const eta =
            parseFloat(timestamp.toString()) + parseFloat(delay.toString() + 1);
        await timelock.queueTransaction(
            timelock.address,
            "0",
            "setPendingAdmin(address)",
            "0x" +
                abi.rawEncode(["address"], [governor.address]).toString("hex"),
            eta
        );
        await time.increaseTo(eta);
        await timelock.executeTransaction(
            timelock.address,
            "0",
            "setPendingAdmin(address)",
            "0x" +
                abi.rawEncode(["address"], [governor.address]).toString("hex"),
            eta
        );
        await governor.__acceptAdmin();
    });

    it("cast vote setConnectorImpl", async () => {
        const bptConnector = await BptConnector.new();

        await expectRevert(
            connectorFactory.setConnectorImpl("1", bptConnector.address, {
                from: alice
            }),
            "Ownable: caller is not the owner"
        );

        let bptConnectorAddress = await connectorFactory.connectorImpls("1");
        expect(bptConnectorAddress).to.be.bignumber.equals(
            constants.ZERO_ADDRESS
        );

        const targets = [connectorFactory.address];
        const values = ["0"];
        const signatures = ["setConnectorImpl(uint8,address)"];
        const calldatas = [
            "0x" +
                abi
                    .rawEncode(
                        ["uint8", "address"],
                        ["1", bptConnector.address]
                    )
                    .toString("hex")
        ];

        await symbloxToken.delegate(admin);
        await governor.propose(
            targets,
            values,
            signatures,
            calldatas,
            "setConnectorImpl"
        );

        const proposalId = await governor.latestProposalIds(admin);
        console.log(`proposalId: ${proposalId}`);

        let state = await governor.state(proposalId);
        expect(state).to.be.bignumber.equals("0");

        const votingDelay = await governor.votingDelay();
        const curBlock = await time.latestBlock();
        const startBlock = curBlock.addn(votingDelay.toNumber());
        await time.advanceBlockTo(startBlock);

        await governor.castVote(proposalId, true);
        await expectRevert(
            governor.queue(proposalId),
            "Governor::queue: proposal can only be queued if it is succeeded"
        );
        await governor.castVote(proposalId, true, {from: alice});
        await governor.castVote(proposalId, true, {from: bob});

        const votingPeriod = await governor.votingPeriod();
        await time.advanceBlockTo(startBlock.addn(votingPeriod.toNumber()));
        state = await governor.state(proposalId);

        await governor.queue(proposalId);
        const proposal = await governor.proposals(proposalId);
        await time.increaseTo(parseFloat(proposal.eta) + 1);
        await governor.execute(proposalId);

        bptConnectorAddress = await connectorFactory.connectorImpls("1");
        expect(bptConnectorAddress).to.be.bignumber.not.equals(
            constants.ZERO_ADDRESS
        );
    });
});
