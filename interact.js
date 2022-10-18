// create the new hwang market contract
const { alchemyApiKey } = require("./secrets.json");

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require("build/GameContract.json");
const contractAddress = "0xC3D3D77251e9be5651FeBd08fd87e340Be4BD49A";

export const contract = new web3.eth.Contract(contractABI, contractAddress);

export const loadCurrentMessage = async () => {
  await contract.createGame();
  return contract.gameContractRegistry(0); // NOTE: here we hardcode the first contract, it is not right, but eehhh
};
