var IterableMapping = artifacts.require("IterableMapping.sol");
var HwangMarket = artifacts.require("HwangMarket.sol");
var MainToken = artifacts.require("MainToken.sol");
var GameContractFactory = artifacts.require("GameContractFactory.sol");
var GameTokenFactory = artifacts.require("GameERC20TokenFactory.sol");

async function doDeploy(deployer, network) {
  // await deployer.deploy(IterableMapping);
  if (network === "development") {
    const iterableMapping = await deployer.deploy(IterableMapping);
    await deployer.link(iterableMapping, GameContractFactory);
    const gameTokenFactory = await deployer.deploy(GameTokenFactory);
    const gameContractFactory = await deployer.deploy(
      GameContractFactory,
      gameTokenFactory.address
    );
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
    // const gameContractFactory = await deployer.deploy(GameContractFactory);
    // console.log(gameContractFactory.address);
    // deployed game contract factory address: 0x7aDB5E2CDC756D13fcc473EAC79c40fD677856ce
    const gameContractFactoryAddr =
      "0x7aDB5E2CDC756D13fcc473EAC79c40fD677856ce";

    // const gameTokenFactory = await deployer.deploy(GameTokenFactory);
    // console.log(gameTokenFactory.address);
    // deployed game token factory address: 0x7a875236593fd5Ac5AA5E25e32B281f0c57cF46f
    const gameTokenFactoryAddr = "0x7a875236593fd5Ac5AA5E25e32B281f0c57cF46f";

    // const mainToken = await deployer.deploy(MainToken);
    // deployed main token address:  0x9284e4C26f5A37Bb0F1B46272e1155E5cD5cd4D0
    const mainTokenAddress = "0x9284e4C26f5A37Bb0F1B46272e1155E5cD5cd4D0";

    await deployer.deploy(
      HwangMarket,
      mainTokenAddress,
      gameContractFactoryAddr
    ); // 0xd71D6E0979bF943bB14adA44a3877c4855299B95
  }
}

module.exports = function (deployer, network, accounts) {
  console.log("deploying from account: ", accounts[0]);
  deployer.then(async () => {
    await doDeploy(deployer, network);
  });
};
