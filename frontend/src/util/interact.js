/* Abstractions to deal with all functions interacting with the blockchain */
require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const hwangMarketABI = require("../contracts/HwangMarket-abi.json");
const hwantMarketAddr = "0xD7cC913Bf990a0D91ba4E3Ed5D9a5575f4BCFe16";

export const hwangMarket = new web3.eth.Contract(
  hwangMarketABI,
  hwantMarketAddr
);
