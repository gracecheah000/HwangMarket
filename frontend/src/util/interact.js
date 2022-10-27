import { game2MainConversionRate } from "./helper";

/* Abstractions to deal with all functions interacting with the blockchain */
require("dotenv").config();
// const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
// const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
// const web3 = createAlchemyWeb3(alchemyKey);

// For development on local ganache, on goerli test net, its the above commented out snippet
const Web3 = require("web3");
export const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545")
);
// End

const hwangMarketABI = require("../contracts/HwangMarket-abi.json");
const hwangMarketAddr = process.env.REACT_APP_HwangMarket_Address;

export const gameContractABI = require("../contracts/GameContract-abi.json");
const mainTokenABI = require("../contracts/MainToken-abi.json");
const gameTokenABI = require("../contracts/GameERC20Token-abi.json");

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

export const getGameById = async (id, setGame) => {
  const game = await hwangMarket.methods.gameContractRegistry(id).call();
  console.log("got game: ", game);
  setGame(game);
};

export const getGameTrxs = async (gameAddr, setGameTrxs) => {
  const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);
  const trxs = await gameContract.methods.getTrxs().call();
  console.log("received trxs: ", trxs);
  setGameTrxs(trxs);
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
  const games = await hwangMarket.methods.getAllGames().call();
  return games;
};

export const joinGame = async (gameAddr, playerAddr, ethAmt, betSide) => {
  if (!window.ethereum || !playerAddr || !gameAddr) {
    return {
      status:
        "💡 Connect your Metamask wallet to update the message on the blockchain.",
    };
  }

  const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);

  const transactionParameters = {
    to: gameAddr, // Required except during contract publications.
    from: playerAddr, // must match user's active address.
    value: ethAmt.toString(),
    data: gameContract.methods
      .addPlayer(playerAddr, ethAmt, betSide)
      .encodeABI(),
  };

  //sign the transaction
  try {
    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
  } catch (error) {
    console.log("error thrown:", error);
  }
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
  const gameContract = new web3.eth.Contract(gameContractABI, gameAddr);

  const transactionParameters = {
    to: gameAddr, // Required except during contract publications.
    from: wallet, // must match user's active address.
    data: gameContract.methods
      .addPlayer(wallet, game2MainConversionRate * buyTokenAmt, buyTokenSide)
      .encodeABI(),
  };

  //sign the transaction
  try {
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
