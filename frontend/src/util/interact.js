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
