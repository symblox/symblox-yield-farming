const {expectEvent, expectRevert} = require("@openzeppelin/test-helpers");

const MockContract = artifacts.require("MockContract");
const ConnectorFactory = artifacts.require("ConnectorFactory");

contract("ConnectorFactory", function () {
    describe("ConnectorFactory", async function () {
        beforeEach(async function () {
            rewardManagerMock = await MockContract.new();
            this.factory = await ConnectorFactory.new(
                rewardManagerMock.address
            );
        });
        it("should set connector implementation", async function () {
            ConnectorImpl = await MockContract.new();
            const setImplTx = await this.factory.setConnectorImpl(
                0, // pool id
                ConnectorImpl.address
            );
            expectEvent(setImplTx, "LogSetImplementation", {
                implementation: ConnectorImpl.address
            });
        });
        it("should error to create connector when implementation is not set", async function () {
            const lpToken = await MockContract.new();
            const createConnErrTx = this.factory.createConnector(
                lpToken.address,
                0 // pool id
            );
            expectRevert(createConnErrTx, "ERR_IMPL_NOT_FOUND");
        });
        it("should create 1 connector", async function () {
            // Set the implementation first
            ConnectorImpl = await MockContract.new();
            await this.factory.setConnectorImpl(
                0, // pool id
                ConnectorImpl.address
            );
            // Create a new connector
            const lpToken = await MockContract.new();
            const createConnTx = await this.factory.createConnector(
                lpToken.address,
                0 // pool id
            );
            expectEvent(createConnTx, "LogCreateConnector");
        });
    });
});
