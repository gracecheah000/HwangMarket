var HwangMarket = artifacts.require("HwangMarket.sol");
module.exports = function (deployer, network, accounts) {
  console.log("deploying from account: ", accounts[0]);
  deployer.deploy(HwangMarket, { from: accounts[0] });
};
