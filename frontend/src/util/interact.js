import { BigNumber } from "ethers";
import {
  eth2MainConversionRate,
  game2MainConversionRate,
  identfyToken,
} from "./helper";

/* Abstractions to deal with all functions interacting with the blockchain */
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, `./.env.production`),
});

let temp = null;

if (process.env.NODE_ENV === "development") {
  const Web3 = require("web3");
  temp = new Web3(
    new Web3.providers.WebsocketProvider(process.env.REACT_APP_Local_Provider)
  );
} else {
  const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
  const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
  temp = createAlchemyWeb3(alchemyKey);
}

export const web3 = temp;

const hwangMarketABI = require("../contracts/HwangMarket-abi.json");
export const hwangMarketAddr = process.env.REACT_APP_HwangMarket_Address;

export const gameContractABI = require("../contracts/GameContract-abi.json");
export const mainTokenABI = require("../contracts/MainToken-abi.json");
const gameTokenABI = require("../contracts/GameERC20Token-abi.json");
const iListableTokenABI = require("../contracts/IListableToken-abi.json");
export const erc20TokenABI = require("../contracts/IERC20-abi.json");

export const hwangMarket = new web3.eth.Contract(
  hwangMarketABI,
  hwangMarketAddr
);

export const createAGame = async (
  address,
  resolveTime,
  oracleAddr,
  threshold,
  category,
  title
) => {
  if (!window.ethereum || address === null) {
    return {
      status:
        "💡 Connect your Metamask wallet to update the message on the blockchain.",
    };
  }

  const transactionParameters = {
    to: hwangMarketAddr, // Required except during contract publications.
    from: address, // must match user's active address.
    data: hwangMarket.methods
      .createGame(
        resolveTime,
        oracleAddr,
        threshold.toString(),
        category,
        title
      )
      .encodeABI(),
  };

  //sign the transaction
  try {
    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
  } catch (error) {
    console.log("something went wrong!", error);
  }
};

export const getGameById = async (id) => {
  if (!id) {
    return {};
  }
  const gameAddr = await hwangMarket.methods.gameId2Addr(id).call();
  const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);
  return await gameContract.methods.getGameInfo().call();
};

export const getGameByAddr = async (gameAddr) => {
  if (!gameAddr) {
    console.log("get game by addr received invalid addr (empty)");
    return;
  }
  const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);
  const info = await gameContract.methods.getGameInfo().call();
  return info;
};

export const getMainTokenAddr = async () => {
  return await hwangMarket.methods.mainTokenAddress().call();
};

export const getGameTrxsByAddr = async (gameAddr) => {
  if (!gameAddr) {
    return [];
  }
  const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);
  const trxs = await gameContract.methods.getTrxs().call();
  return trxs;
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getAllGames = async () => {
  const gamesAddrs = await hwangMarket.methods.getAllGames().call();
  const ongoingGames = await Promise.all(
    gamesAddrs.ongoingGames.map(async (addr) => await getGameByAddr(addr))
  );
  const closedGames = await Promise.all(
    gamesAddrs.closedGames.map(async (addr) => await getGameByAddr(addr))
  );
  return { ongoingGames, closedGames };
};

export const getMainTokenBalance = async (ownerAddr) => {
  if (!window.ethereum || !ownerAddr) {
    return 0;
  }
  const mainTokenAddr = await hwangMarket.methods.mainTokenAddress().call();
  const mainTokenContract = new web3.eth.Contract(mainTokenABI, mainTokenAddr);

  return await mainTokenContract.methods.balanceOf(ownerAddr).call();
};

export const getMainToken2SenderApprovalAmt = async (ownerAddr, senderAddr) => {
  if (!window.ethereum || !ownerAddr || !senderAddr) {
    return 0;
  }
  const mainTokenAddr = await hwangMarket.methods.mainTokenAddress().call();
  const mainTokenContract = new web3.eth.Contract(mainTokenABI, mainTokenAddr);

  return await mainTokenContract.methods
    .allowance(ownerAddr, senderAddr)
    .call();
};

export const withdrawWinnings = async (ownerAddr, gameAddr, withdrawAmt) => {
  if (!ownerAddr || !gameAddr || !withdrawAmt) {
    return { trxHash: "", err: "Bad fields to withdraw" };
  }
  //sign the transaction
  try {
    const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);

    const transactionParameters = {
      to: gameAddr, // Required except during contract publications.
      from: ownerAddr, // must match user's active address.
      data: gameContract.methods.withdrawWinnings(withdrawAmt).encodeABI(),
    };
    const trxHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return { trxHash: trxHash, err: "" };
  } catch (error) {
    console.log("error thrown:", error.message);
    return { trxHash: "", err: error.message };
  }
};

export const getTokenAllowance = async (ownerAddr, senderAddr, tokenAddr) => {
  if (!window.ethereum || !ownerAddr || !senderAddr || !tokenAddr) {
    return 0;
  }

  const tokenContract = new web3.eth.Contract(erc20TokenABI, tokenAddr);

  return await tokenContract.methods.allowance(ownerAddr, senderAddr).call();
};

export const getGameTokenAddrByGameAddr = async (gameAddr, side) => {
  if (!window.ethereum || !gameAddr || (side !== 1 && side !== 2)) {
    return "";
  }

  const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);
  let gtAddr = "";
  if (side === 1) {
    gtAddr = await gameContract.methods.gameYesTokenContractAddress().call();
  } else {
    gtAddr = await gameContract.methods.gameNoTokenContractAddress().call();
  }
  return gtAddr;
};

export const approveMainTokenSender = async (
  wallet,
  senderAddr,
  mainTokenAmt
) => {
  if (!window.ethereum || !wallet || !senderAddr) {
    return "";
  }
  const mainTokenAddr = await hwangMarket.methods.mainTokenAddress().call();
  const mainTokenContract = new web3.eth.Contract(mainTokenABI, mainTokenAddr);
  const transactionParameters = {
    to: mainTokenAddr, // Required except during contract publications.
    from: wallet, // must match user's active address.
    data: mainTokenContract.methods
      .approve(senderAddr, mainTokenAmt)
      .encodeABI(),
  };

  //sign the transaction
  try {
    const trxHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return trxHash;
  } catch (error) {
    console.log("error thrown:", error.message);
  }
  return "";
};

export const approveTokenSender = async (
  tokenAddr,
  owner,
  sender,
  approvalAmt
) => {
  if (!window.ethereum || !tokenAddr || !owner || !sender || !approvalAmt) {
    return "";
  }
  const tokenContract = new web3.eth.Contract(erc20TokenABI, tokenAddr);
  const transactionParameters = {
    to: tokenAddr, // Required except during contract publications.
    from: owner, // must match user's active address.
    data: tokenContract.methods.approve(sender, approvalAmt).encodeABI(),
  };

  //sign the transaction
  try {
    const trxHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return trxHash;
  } catch (error) {
    console.log("error thrown:", error.message);
  }
  return "";
};

export const mintGameTokenFromMainToken = async (
  wallet,
  gameAddr,
  buyTokenSide,
  buyTokenAmt,
  maxLimit
) => {
  if (
    !window.ethereum ||
    !wallet ||
    (buyTokenSide !== "1" && buyTokenSide !== "2") ||
    buyTokenAmt < 0 ||
    buyTokenAmt > maxLimit
  ) {
    return { trxHash: "", err: "" };
  }

  //sign the transaction
  try {
    const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);

    const transactionParameters = {
      to: gameAddr, // Required except during contract publications.
      from: wallet, // must match user's active address.
      data: gameContract.methods
        .addPlayer(wallet, game2MainConversionRate * buyTokenAmt, buyTokenSide)
        .encodeABI(),
    };

    const trxHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return { trxHash: trxHash, err: "" };
  } catch (error) {
    console.log("error thrown:", error.message);
    return { trxHash: "", err: error.message };
  }
};

export const getBalance = async (wallet, gameAddr, side) => {
  if (!wallet || !gameAddr || (side !== 1 && side !== 2)) {
    return 0;
  }
  const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);
  let gtAddr = "";
  if (side === 1) {
    gtAddr = await gameContract.methods.gameYesTokenContractAddress().call();
  } else {
    gtAddr = await gameContract.methods.gameNoTokenContractAddress().call();
  }
  const gameTokenContract = new web3.eth.Contract(gameTokenABI, gtAddr);
  return await gameTokenContract.methods.balanceOf(wallet).call();
};

export const getERC20Tokenbalance = async (wallet, tokenAddr) => {
  if (!wallet || !tokenAddr) {
    return 0;
  }
  const erc20TokenContract = new web3.eth.Contract(erc20TokenABI, tokenAddr);
  return await erc20TokenContract.methods.balanceOf(wallet).call();
};

export const listTokensUp = async (
  wallet,
  token1Addr,
  token1Amt,
  token2Addr,
  token2Amt
) => {
  if (!wallet || !token1Addr || !token1Amt || !token2Addr || !token2Amt) {
    return { trxHash: "", err: "Invalid fields to create listing." };
  }

  //sign the transaction
  try {
    const gameToken = new web3.eth.Contract(gameTokenABI, token1Addr);

    const transactionParameters = {
      to: token1Addr, // Required except during contract publications.
      from: wallet, // must match user's active address.
      data: gameToken.methods
        .listUpTokensForExchange(token1Amt, token2Addr, token2Amt)
        .encodeABI(),
    };
    const trxHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return { trxHash: trxHash, err: "" };
  } catch (error) {
    console.log("error thrown:", error.message);
    return { trxHash: "", err: error.message };
  }
};

export const acceptTokenExchange = async (wallet, listing) => {
  if (!wallet || !listing.token2 || !listing.listingAddr) {
    return { trxHash: "", err: "Invalid fields to accept listing exchange." };
  }

  //sign the transaction
  try {
    const iListableTokenContract = new web3.eth.Contract(
      iListableTokenABI,
      listing.token2
    );

    const transactionParameters = {
      to: listing.token2, // Required except during contract publications.
      from: wallet, // must match user's active address.
      data: iListableTokenContract.methods
        .acceptTokenExchange(listing.listingAddr)
        .encodeABI(),
    };
    const trxHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return { trxHash: trxHash, err: "" };
  } catch (error) {
    console.log("error thrown:", error.message);
    return { trxHash: "", err: error.message };
  }
};

export const getNetworkTokenBalance = async (wallet) => {
  if (!wallet) {
    return 0;
  }
  return await web3.eth.getBalance(wallet);
};

export const getNetworkTokenInfo = async () => {
  const chainId = await web3.eth.getChainId();
  return identfyToken(chainId);
};

export const getNetworkID = async () => {
  return await web3.eth.net.getNetworkType();
};

export const mintMainToken = async (wallet, mintAmt) => {
  if (!wallet || !mintAmt) {
    return { trxHash: "", err: "Invalid fields to mint HMTKN." };
  }

  //sign the transaction
  try {
    const mainTokenAddr = await hwangMarket.methods.mainTokenAddress().call();
    const mainTokenContract = new web3.eth.Contract(
      mainTokenABI,
      mainTokenAddr
    );
    const transactionParameters = {
      to: mainTokenAddr, // Required except during contract publications.
      from: wallet, // must match user's active address.
      value: BigNumber.from(mintAmt)
        .mul(1 / eth2MainConversionRate)
        .toHexString(),
      data: mainTokenContract.methods
        .mint(wallet, BigNumber.from(mintAmt).toString())
        .encodeABI(),
    };
    const trxHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return { trxHash: trxHash, err: "" };
  } catch (error) {
    console.log("error thrown:", error.message);
    return { trxHash: "", err: error.message };
  }
};

export const cashoutMainToken = async (wallet, cashoutAmt) => {
  if (!wallet || !cashoutAmt) {
    return { trxHash: "", err: "Invalid fields to cashout HMTKN." };
  }

  //sign the transaction
  try {
    const mainTokenAddr = await hwangMarket.methods.mainTokenAddress().call();
    const mainTokenContract = new web3.eth.Contract(
      mainTokenABI,
      mainTokenAddr
    );
    const transactionParameters = {
      to: mainTokenAddr, // Required except during contract publications.
      from: wallet, // must match user's active address.
      data: mainTokenContract.methods.cashout(cashoutAmt).encodeABI(),
    };
    const trxHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return { trxHash: trxHash, err: "" };
  } catch (error) {
    console.log("error thrown:", error.message);
    return { trxHash: "", err: error.message };
  }
};

export const triggerResolve = async (wallet, gameAddr) => {
  if (!wallet || !gameAddr) {
    return;
  }

  //sign the transaction
  try {
    const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);
    const transactionParameters = {
      to: gameAddr, // Required except during contract publications.
      from: wallet, // must match user's active address.
      data: gameContract.methods.performUpkeep().encodeABI(),
    };
    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
  } catch (error) {
    console.log("error thrown:", error.message);
  }
};

export const getPlayersTrxRecords = async (wallet) => {
  if (!wallet) {
    return [];
  }

  return await hwangMarket.methods.getPlayersTrxRecords(wallet).call();
};
