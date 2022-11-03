var IterableMapping = artifacts.require("IterableMapping.sol");
var HwangMarket = artifacts.require("HwangMarket.sol");
var MainToken = artifacts.require("MainToken.sol");

async function doDeploy(deployer, network) {
  // await deployer.deploy(IterableMapping);
  if (network === "development") {
    const iterableMapping = await deployer.deploy(IterableMapping);
    await deployer.link(iterableMapping, HwangMarket);
    const mainToken = await deployer.deploy(MainToken);
    await deployer.deploy(HwangMarket, mainToken.address);
  } else {
    // const iterableMapping = await IterableMapping.at(
    //   "0x030a05d44b4e0ef85F2d34c4615F375671adf0dd"
    // );
    // await deployer.link(iterableMapping, HwangMarket);
    const mainToken = await deployer.deploy(MainToken);
    console.log(mainToken);
    console.log(mainToken && mainToken.address);
    // await deployer.deploy(HwangMarket, mainToken.address);
  }
}

module.exports = function (deployer, network, accounts) {
  console.log("deploying from account: ", accounts[0]);
  deployer.then(async () => {
    await doDeploy(deployer, network);
  });
};
