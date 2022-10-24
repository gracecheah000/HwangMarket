var IterableMapping = artifacts.require("IterableMapping.sol");
var HwangMarket = artifacts.require("HwangMarket.sol");

async function doDeploy(deployer, network) {
  await deployer.deploy(IterableMapping);
  await deployer.link(IterableMapping, HwangMarket);
  await deployer.deploy(HwangMarket);
}

module.exports = function (deployer, network, accounts) {
  console.log("deploying from account: ", accounts[0]);
  deployer.then(async () => {
    await doDeploy(deployer, network);
  });
};
