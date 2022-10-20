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
  joinGame,
} from "../util/interact";

import CreateGame from "./CreateGame";

const GamesGallery = ({ walletAddress, colorMode }) => {
  const [status, setStatus] = useState("");
  const [getGameId, setGetGameId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);

  function addHwangMarketListener() {
    console.log("hwang market game created listener added");
    hwangMarket.events.GameCreated({}, (error, data) => {
      if (error) {
        setStatus("😥 " + error.message);
      } else {
        console.log("data returned from hwang market listener: ", data);
        // setGamesAddr((prev) =>
        //   prev.concat(data.returnValues.gameAddr.toString())
        // );
        setStatus("🎉 Your game was created!");
      }
    });

    console.log("hwang market player joined game listener added");
    hwangMarket.events.PlayerJoinedGameEvent({}, (error, data) => {
      if (error) {
        setStatus("😥 " + error.message);
      } else {
        console.log("data returned from hwang market listener: ", data);
        // setGamesAddr((prev) =>
        //   prev.concat(data.returnValues.gameAddr.toString())
        // );
        setStatus("🎉 player joined the game!");
      }
    });
  }

  useEffect(() => {
    addHwangMarketListener();
    setLoading(true);
    async function getGames() {
      // const { fetchedGames } = getAllGames();
      // setGames(fetchedGames);
      setLoading(false);
    }
    getGames();
  }, []);

  const pressJoinGame = async () => {
    const { status } = await joinGame(
      "0xdbd75dd9dcaEf0b5cf6f3FA00A57a719F786a902",
      walletAddress,
      1,
      1
    );
    setStatus(status);
  };

  return (
    <Box border="1px solid red">
      <Heading>Games Gallery</Heading>
      <NumberInput value={getGameId} onChange={(v) => setGetGameId(v)}>
        <NumberInputField></NumberInputField>
      </NumberInput>
      <Button onClick={() => getGameAddrById(getGameId)}>
        get game {getGameId}
      </Button>
      <CreateGame
        walletAddress={walletAddress}
        setStatus={setStatus}
        colorMode={colorMode}
      />
      <Text>{status}</Text>
      Number of games: {games.length}
      {games && games.map((g) => <Text key={g}>{g}</Text>)}
      <Button onClick={pressJoinGame}>
        join 0xdbd75dd9dcaEf0b5cf6f3FA00A57a719F786a902 bet YES, betting amount
        of 1wei
      </Button>
    </Box>
  );
};

export default GamesGallery;
