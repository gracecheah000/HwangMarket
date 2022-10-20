import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  NumberInput,
  NumberInputField,
  useColorMode,
} from "@chakra-ui/react";
import {
  hwangMarket,
  createAGame,
  getGameAddrById,
  getCurrentWalletConnected,
  connectWallet,
} from "../util/interact";

import CreateGame from "./CreateGame";

const GamesGallery = () => {
  const [status, setStatus] = useState("");
  const [gamesAddr, setGamesAddr] = useState([]);
  const [walletAddress, setWallet] = useState("");
  const [getGameId, setGetGameId] = useState(0);

  function addHwangMarketListener() {
    console.log("hwang market listener added");
    hwangMarket.events.GameCreated({}, (error, data) => {
      if (error) {
        setStatus("😥 " + error.message);
      } else {
        console.log("data returned from hwang market listener: ", data);
        setGamesAddr((prev) =>
          prev.concat(data.returnValues.gameAddr.toString())
        );
        setStatus("🎉 Your game was created!");
      }
    });
  }

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  useEffect(() => {
    addHwangMarketListener();

    async function fetchWallet() {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    }
    fetchWallet();

    addWalletListener();
  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box border="1px solid red">
      <Heading>Games Gallery</Heading>
      <Button onClick={toggleColorMode}>
        Toggle {colorMode === "light" ? "Dark" : "Light"}
      </Button>
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
      <NumberInput value={getGameId} onChange={(v) => setGetGameId(v)}>
        <NumberInputField></NumberInputField>
      </NumberInput>
      <Button onClick={() => getGameAddrById(getGameId)}>
        get game {getGameId}
      </Button>
      <CreateGame walletAddress={walletAddress} setStatus={setStatus} />
      <Text>{status}</Text>
      Number of games: {gamesAddr.length}
      {gamesAddr && gamesAddr.map((g) => <Text>{g}</Text>)}
    </Box>
  );
};

export default GamesGallery;
