import React, { useEffect, useState } from "react";
import { Box, Heading, Text, useColorMode } from "@chakra-ui/react";
import { hwangMarket, getAllGames } from "../util/interact";

import CreateGame from "./CreateGame";
import GameCard from "./GameCard";

const GamesGallery = ({ walletAddress, colorMode }) => {
  const [status, setStatus] = useState("");
  const [getGameId, setGetGameId] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [ongoingGames, setOngoingGames] = useState(null);
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
        // setStatus("🎉 Your game was created!");
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
        mt="7"
      >
        <Text
          px="4"
          py="2"
          border={colorMode === "light" ? "1px solid black" : "1px solid white"}
          borderRadius="10px"
        >
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
        {isLoading ? (
          <Heading>Loading...</Heading>
        ) : (
          ongoingGames &&
          ongoingGames
            .slice()
            .reverse()
            .map((g) => <GameCard key={g.addr} game={g} />)
        )}
      </Box>
    </Box>
  );
};

export default GamesGallery;
