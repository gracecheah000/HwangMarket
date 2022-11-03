var IterableMapping = artifacts.require("IterableMapping.sol");
var HwangMarket = artifacts.require("HwangMarket.sol");
var MainToken = artifacts.require("MainToken.sol");
var GameContractFactory = artifacts.require("GameContractFactory.sol");

async function doDeploy(deployer, network) {
  // await deployer.deploy(IterableMapping);
  if (network === "development") {
    const iterableMapping = await deployer.deploy(IterableMapping);
    await deployer.link(iterableMapping, GameContractFactory);
    const gameContractFactory = await deployer.deploy(GameContractFactory);
    const mainToken = await deployer.deploy(MainToken);
    await deployer.deploy(
      HwangMarket,
      mainToken.address,
      gameContractFactory.address
    );
  } else {
    // Because we are poor, we deploy the contracts one at a time
    // Technically, if you are rich, you can just do the deployment
    // like in development
    // const iterableMapping = await deployer.deploy(IterableMapping);
    // deployed iterable mapping address: 0x030a05d44b4e0ef85F2d34c4615F375671adf0dd

    const iterableMapping = await IterableMapping.at(
      "0x030a05d44b4e0ef85F2d34c4615F375671adf0dd"
    );
    await deployer.link(iterableMapping, GameContractFactory);
    const gameContractFactory = await deployer.deploy(GameContractFactory);
    console.log(gameContractFactory.address);

    // const mainToken = await deployer.deploy(MainToken);
    // deployed main token address:  0x2255606A1fe4F5b071149A4D438E3Ad7008343Dc

    // await deployer.deploy(
    //   HwangMarket,
    //   "0x2255606A1fe4F5b071149A4D438E3Ad7008343Dc"
    // );
  }
}

module.exports = function (deployer, network, accounts) {
  console.log("deploying from account: ", accounts[0]);
  deployer.then(async () => {
    await doDeploy(deployer, network);
  });
};
