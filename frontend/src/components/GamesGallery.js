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
  getAllGames,
  joinGame,
} from "../util/interact";

import CreateGame from "./CreateGame";
import GameCard from "./GameCard";

const GamesGallery = ({ walletAddress, colorMode }) => {
  const [status, setStatus] = useState("");
  const [getGameId, setGetGameId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ongoingGames, setOngoingGames] = useState([]);
  const [closedGames, setClosedGames] = useState([]);

  function addHwangMarketListener() {
    console.log("hwang market game created listener added");
    hwangMarket.events.GameCreated({}, (error, data) => {
      if (error) {
        setStatus("😥 " + error.message);
      } else if (data && data.returnValues && data.returnValues.gameMetadata) {
        console.log(
          "received game created event",
          data.returnValues.gameMetadata
        );
        setOngoingGames((prev) => [...prev, data.returnValues.gameMetadata]);
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
      const games = await getAllGames();
      console.log("games loaded in", games);
      setOngoingGames(games.ongoingGames);
      setClosedGames(games.closedGames);
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
    <Box px="28" py="16">
      <Heading size="2xl" textAlign="center">
        Games Gallery
      </Heading>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        columnGap="10"
      >
        <Text px="4" py="2" border="1px solid white" borderRadius="10px">
          Number of open games: {ongoingGames ? ongoingGames.length : 0}
        </Text>
        <CreateGame
          walletAddress={walletAddress}
          setStatus={setStatus}
          colorMode={colorMode}
        />
      </Box>
      <Text>{status}</Text>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        rowGap="16"
        columnGap="16"
        my="24"
      >
        {ongoingGames &&
          ongoingGames.map((g) => <GameCard key={g.addr} game={g} />)}
      </Box>
    </Box>
  );
};

export default GamesGallery;
