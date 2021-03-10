const {
    BN,
    time,
    ether,
    constants,
    expectRevert
} = require("@openzeppelin/test-helpers");
const {expect} = require("chai");
const SymbloxToken = artifacts.require("SymbloxToken");
const {signERC2612Permit} = require("eth-permit");
const EIP712 = require("../../scripts/EIP712.js");

const Domain = contract => ({
    name: "Symblox",
    chainId: 1,
    verifyingContract: contract.address
});
const Types = {
    Delegation: [
        {name: "delegatee", type: "address"},
        {name: "nonce", type: "uint256"},
        {name: "expiry", type: "uint256"}
    ]
};

const privateKey_bob =
    "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1";

contract("SymbloxToken", ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.symblox = await SymbloxToken.new("Symblox", "SYX", 18, []);
        this.symblox2 = await SymbloxToken.new("Symblox", "SYX", 18, [
            this.symblox.address
        ]);
    });

    it("mint to large", async () => {
        newSymblox = await SymbloxToken.new(
            "Symblox",
            "SYX",
            18,
            [this.symblox.address, this.symblox2.address],
            {
                from: alice
            }
        );

        await expectRevert(
            newSymblox.mint(newSymblox.address, "100000000000000000000000000", {
                from: alice
            }),
            "exceed the maximum supply quantity"
        );
    });

    it("exchange new syx", async () => {
        newSymblox = await SymbloxToken.new(
            "Symblox",
            "SYX",
            18,
            [this.symblox.address, this.symblox2.address],
            {
                from: alice
            }
        );

        await this.symblox.mint(bob, "1000", {from: alice});
        const bobBal = await this.symblox.balanceOf(bob);
        assert.equal(bobBal.valueOf(), "1000");

        let newBobBal = await newSymblox.balanceOf(bob);
        assert.equal(newBobBal.valueOf(), "0");

        await expectRevert(
            newSymblox.exchangeSyx(
                this.symblox.address,
                "100000000000000000000000000",
                {
                    from: bob
                }
            ),
            "exceed the maximum supply quantity"
        );

        await this.symblox.approve(newSymblox.address, "1000", {from: bob});
        await newSymblox.exchangeSyx(this.symblox.address, "1000", {from: bob});

        await expectRevert(
            this.symblox.exchangeSyx(newSymblox.address, "1000", {
                from: alice
            }),
            "token not support"
        );

        newBobBal = await newSymblox.balanceOf(bob);
        assert.equal(newBobBal.valueOf(), "1000");
    });

    it("should have correct name and symbol and decimal", async () => {
        const name = await this.symblox.name();
        const symbol = await this.symblox.symbol();
        const decimals = await this.symblox.decimals();
        assert.equal(name.valueOf(), "Symblox");
        assert.equal(symbol.valueOf(), "SYX");
        assert.equal(decimals.valueOf(), "18");
    });

    it("should only allow minter to mint token", async () => {
        await this.symblox.mint(alice, "100", {from: alice});
        await this.symblox.mint(bob, "1000", {from: alice});
        await expectRevert(
            this.symblox.mint(carol, "1000", {from: bob}),
            "MinterRole: caller does not have the Minter role"
        );
        const totalSupply = await this.symblox.totalSupply();
        const aliceBal = await this.symblox.balanceOf(alice);
        const bobBal = await this.symblox.balanceOf(bob);
        const carolBal = await this.symblox.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), "1100");
        assert.equal(aliceBal.valueOf(), "100");
        assert.equal(bobBal.valueOf(), "1000");
        assert.equal(carolBal.valueOf(), "0");
    });

    it("should supply token transfers properly", async () => {
        await this.symblox.mint(alice, "100", {from: alice});
        await this.symblox.mint(bob, "1000", {from: alice});
        await this.symblox.transfer(carol, "10", {from: alice});
        await this.symblox.transfer(carol, "100", {from: bob});
        const totalSupply = await this.symblox.totalSupply();
        const aliceBal = await this.symblox.balanceOf(alice);
        const bobBal = await this.symblox.balanceOf(bob);
        const carolBal = await this.symblox.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), "1100");
        assert.equal(aliceBal.valueOf(), "90");
        assert.equal(bobBal.valueOf(), "900");
        assert.equal(carolBal.valueOf(), "110");
    });

    it("should fail if you try to do bad transfers", async () => {
        await this.symblox.mint(alice, "100", {from: alice});
        await expectRevert(
            this.symblox.transfer(carol, "110", {from: alice}),
            "ERC20: transfer amount exceeds balance"
        );
        await expectRevert(
            this.symblox.transfer(carol, "1", {from: bob}),
            "ERC20: transfer amount exceeds balance"
        );
    });

    it("reverts if the signatory is invalid", async () => {
        const delegatee = alice,
            nonce = 0,
            expiry = 0;

        await expectRevert(
            this.symblox.delegateBySig(
                delegatee,
                nonce,
                expiry,
                0,
                "0xbad",
                "0xbad",
                {
                    from: bob
                }
            ),
            "ERR_SIG"
        );
    });

    it("reverts if the nonce is bad ", async () => {
        const delegatee = alice,
            nonce = 1,
            expiry = 0;
        const {v, r, s} = EIP712.sign(
            Domain(this.symblox),
            "Delegation",
            {delegatee, nonce, expiry},
            Types,
            privateKey_bob
        );

        await expectRevert(
            this.symblox.delegateBySig(delegatee, nonce, expiry, v, r, s, {
                from: bob
            }),
            "ERR_SIG_NONCE"
        );
    });

    it("reverts if the signature has expired", async () => {
        const delegatee = alice,
            nonce = 0,
            expiry = 0;
        const {v, r, s} = EIP712.sign(
            Domain(this.symblox),
            "Delegation",
            {delegatee, nonce, expiry},
            Types,
            privateKey_bob
        );

        await expectRevert(
            this.symblox.delegateBySig(delegatee, nonce, expiry, v, r, s, {
                from: bob
            }),
            "ERR_SIG_EXPIRED"
        );
    });

    it("delegate", async () => {
        const delegatee = alice;
        let res = await this.symblox.delegates(bob);
        expect(res).to.be.equals(constants.ZERO_ADDRESS);
        await this.symblox.delegate(delegatee, {
            from: bob
        });
        res = await this.symblox.delegates(bob);
        expect(res).to.be.equals(delegatee);
    });

    it("delegates on behalf of the signatory", async () => {
        const delegatee = alice,
            nonce = 0,
            expiry = 10e9;

        const {v, r, s} = EIP712.sign(
            Domain(this.symblox),
            "Delegation",
            {delegatee, nonce, expiry},
            Types,
            privateKey_bob
        );

        let res = await this.symblox.delegates(bob);
        expect(res).to.be.equals(constants.ZERO_ADDRESS);
        await this.symblox.delegateBySig(delegatee, nonce, expiry, v, r, s, {
            from: bob
        });
        res = await this.symblox.delegates(bob);
        expect(res).to.be.equals(delegatee);
    });

    it("returns the number of checkpoints for a delegate", async () => {
        let res;
        await this.symblox.mint(alice, "100");

        await this.symblox.transfer(carol, "100", {from: alice});
        res = await this.symblox.numCheckpoints(bob);
        expect(res).to.be.bignumber.equals("0");

        await this.symblox.delegate(bob, {from: carol});
        res = await this.symblox.numCheckpoints(bob);
        expect(res).to.be.bignumber.equals("1");

        await this.symblox.transfer(alice, "10", {from: carol});
        res = await this.symblox.numCheckpoints(bob);
        expect(res).to.be.bignumber.equals("2");

        await this.symblox.transfer(alice, "10", {from: carol});
        res = await this.symblox.numCheckpoints(bob);
        expect(res).to.be.bignumber.equals("3");

        await this.symblox.approve(alice, "20", {from: alice});
        await this.symblox.transferFrom(alice, carol, "20", {from: alice});
        res = await this.symblox.numCheckpoints(bob);
        expect(res).to.be.bignumber.equals("4");

        res = await this.symblox.checkpoints(bob, "0");
        expect(res.votes).to.be.bignumber.equals("100");

        res = await this.symblox.checkpoints(bob, "1");
        expect(res.votes).to.be.bignumber.equals("90");

        res = await this.symblox.checkpoints(bob, "2");
        expect(res.votes).to.be.bignumber.equals("80");

        res = await this.symblox.checkpoints(bob, "3");
        expect(res.votes).to.be.bignumber.equals("100");
    });

    it("reverts if block number >= current block", async () => {
        await expectRevert(
            this.symblox.getPriorVotes(bob, 5e10),
            "ERR_PRIOR_VOTE"
        );
    });

    it("returns 0 if there are no checkpoints", async () => {
        const res = await this.symblox.getPriorVotes(bob, 0);
        expect(res).to.be.bignumber.equals("0");
    });

    it("returns the latest block if >= last checkpoint block", async () => {
        const aliceBalance = ether("100");
        await this.symblox.mint(alice, aliceBalance, {from: alice});
        const t = await this.symblox.delegate(bob, {from: alice});
        await time.advanceBlock();
        await time.advanceBlock();

        let res = await this.symblox.getPriorVotes(bob, t.receipt.blockNumber);
        expect(res).to.be.bignumber.equals(aliceBalance);

        res = await this.symblox.getPriorVotes(bob, t.receipt.blockNumber + 1);
        expect(res).to.be.bignumber.equals(aliceBalance);
    });

    it("returns zero if < first checkpoint block", async () => {
        const aliceBalance = ether("100");
        await this.symblox.mint(alice, aliceBalance, {from: alice});
        await time.advanceBlock();
        const t = await this.symblox.delegate(bob, {from: alice});
        await time.advanceBlock();
        await time.advanceBlock();

        let res = await this.symblox.getPriorVotes(
            bob,
            t.receipt.blockNumber - 1
        );
        expect(res).to.be.bignumber.equals("0");

        res = await this.symblox.getPriorVotes(bob, t.receipt.blockNumber + 1);
        expect(res).to.be.bignumber.equals(aliceBalance);
    });

    it("generally returns the voting balance at the appropriate checkpoint", async () => {
        const aliceBalance = ether("100");
        await this.symblox.mint(alice, aliceBalance, {from: alice});
        let res;
        const t1 = await this.symblox.delegate(bob, {from: alice});
        await time.advanceBlock();
        await time.advanceBlock();
        const t2 = await this.symblox.transfer(carol, ether("10"), {
            from: alice
        });
        await time.advanceBlock();
        await time.advanceBlock();
        const t3 = await this.symblox.transfer(carol, ether("10"), {
            from: alice
        });
        await time.advanceBlock();
        await time.advanceBlock();
        const t4 = await this.symblox.transfer(alice, ether("20"), {
            from: carol
        });
        await time.advanceBlock();
        await time.advanceBlock();

        res = await this.symblox.getPriorVotes(bob, t1.receipt.blockNumber - 1);
        expect(res).to.be.bignumber.equals("0");

        res = await this.symblox.getPriorVotes(bob, t1.receipt.blockNumber);
        expect(res).to.be.bignumber.equals(aliceBalance);

        res = await this.symblox.getPriorVotes(bob, t1.receipt.blockNumber + 1);
        expect(res).to.be.bignumber.equals(aliceBalance);

        res = await this.symblox.getPriorVotes(bob, t2.receipt.blockNumber);
        expect(res).to.be.bignumber.equals(
            new BN(aliceBalance).sub(ether("10"))
        );

        res = await this.symblox.getPriorVotes(bob, t2.receipt.blockNumber + 1);
        expect(res).to.be.bignumber.equals(
            new BN(aliceBalance).sub(ether("10"))
        );

        res = await this.symblox.getPriorVotes(bob, t3.receipt.blockNumber);
        expect(res).to.be.bignumber.equals(
            new BN(aliceBalance).sub(ether("20"))
        );

        res = await this.symblox.getPriorVotes(bob, t3.receipt.blockNumber + 1);
        expect(res).to.be.bignumber.equals(
            new BN(aliceBalance).sub(ether("20"))
        );

        res = await this.symblox.getPriorVotes(bob, t4.receipt.blockNumber);
        expect(res).to.be.bignumber.equals(aliceBalance);

        res = await this.symblox.getPriorVotes(bob, t4.receipt.blockNumber + 1);
        expect(res).to.be.bignumber.equals(aliceBalance);

        res = await this.symblox.getCurrentVotes(bob);
        expect(res).to.be.bignumber.equals(aliceBalance);
    });

    it("permit", async () => {
        const TEST_AMOUNT = ether("10");
        const provider = web3.currentProvider;
        const deadline = constants.MAX_UINT256;
        allowance = await this.symblox.allowance(bob, alice);
        expect(allowance).to.be.bignumber.equals(ether("0"));

        const result = await signERC2612Permit(
            provider,
            this.symblox.address,
            bob,
            alice,
            TEST_AMOUNT.toString()
        );

        await this.symblox.permit(
            bob,
            alice,
            TEST_AMOUNT,
            deadline,
            result.v,
            result.r,
            result.s,
            {from: bob}
        );

        allowance = await this.symblox.allowance(bob, alice);
        expect(allowance).to.be.bignumber.equals(TEST_AMOUNT);
        const nonces = await this.symblox.nonces(bob);
        expect(nonces).to.be.bignumber.equals("1");
    });
});
