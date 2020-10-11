const {expectEvent, expectRevert} = require("@openzeppelin/test-helpers");
const constants = require("@openzeppelin/test-helpers/src/constants");

const MockContract = artifacts.require("MockContract");
const ConnectorFactory = artifacts.require("ConnectorFactory");

contract("ConnectorFactory", function () {
    describe("ConnectorFactory", async function () {
        beforeEach(async function () {
            this.factory = await ConnectorFactory.new(
                (await MockContract.new()).address // reward manager
            );
        });
        it("should set connector implementation", async function () {
            const ConnectorImpl = await MockContract.new();
            const setImplTx = await this.factory.setConnectorImpl(
                0, // pool id
                ConnectorImpl.address
            );
            expectEvent(setImplTx, "LogSetImplementation", {
                implementation: ConnectorImpl.address
            });
        });
        it("should create 1 connector", async function () {
            // Set the implementation first
            const ConnectorImpl = await MockContract.new();
            await this.factory.setConnectorImpl(
                0, // pool id
                ConnectorImpl.address
            );
            // Create a new connector
            expectEvent(
                await this.factory.createConnector(
                    (await MockContract.new()).address, // lpToken
                    0 // pool id
                ),
                "LogCreateConnector"
            );
        });
        it("should fail when set an invalid implementation", async function () {
            const setConnTx = this.factory.setConnectorImpl(
                0, // pool id
                constants.ZERO_ADDRESS
            );
            await expectRevert(setConnTx, "ERR_IMPL_INVALID");
        });
        it("should fail to create connector when implementation is not set", async function () {
            const createConnErrTx = this.factory.createConnector(
                (await MockContract.new()).address,
                0 // pool id
            );
            await expectRevert(createConnErrTx, "ERR_IMPL_NOT_FOUND");
        });
        it("should fail when implementation is existed for the pool", async function () {
            const ConnectorImpl = await MockContract.new();

            await this.factory.setConnectorImpl(
                0, // pool id
                ConnectorImpl.address
            );
            const setConnTx = this.factory.setConnectorImpl(
                0, // pool id
                ConnectorImpl.address
            );
            await expectRevert(setConnTx, "ERR_POOL_EXISTED");
        });
        it("should fail to create 2 connector for the same pool by the user", async function () {
            await this.factory.setConnectorImpl(
                1, // pool id
                (await MockContract.new()).address
            );
            // create the first connector
            await this.factory.createConnector(
                (await MockContract.new()).address,
                1 // pool id
            );
            // create the second connector with the same id
            const createConnTx = this.factory.createConnector(
                (await MockContract.new()).address,
                1 // pool id
            );
            await expectRevert(createConnTx, "ERR_DUP_REWARD_POOL");
        });
    });
});
