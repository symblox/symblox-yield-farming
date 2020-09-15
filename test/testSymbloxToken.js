const {expectRevert} = require("@openzeppelin/test-helpers");
const SymbloxToken = artifacts.require("SymbloxToken");

contract("SymbloxToken", ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.symblox = await SymbloxToken.new({from: alice});
    });

    it("should have correct name and symbol and decimal", async () => {
        const name = await this.symblox.name();
        const symbol = await this.symblox.symbol();
        const decimals = await this.symblox.decimals();
        assert.equal(name.valueOf(), "Symblox");
        assert.equal(symbol.valueOf(), "SYX");
        assert.equal(decimals.valueOf(), "18");
    });

    it("should only allow owner to mint token", async () => {
        await this.symblox.mint(alice, "100", {from: alice});
        await this.symblox.mint(bob, "1000", {from: alice});
        await expectRevert(
            this.symblox.mint(carol, "1000", {from: bob}),
            "Ownable: caller is not the owner"
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
});
