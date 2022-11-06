import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Spinner,
  Switch,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { hwangMarket, getAllGames } from "../util/interact";

import CreateGame from "./CreateGame";
import GameCard from "./GameCard";

const GamesGallery = ({ walletAddress, setGC1 }) => {
  const [status, setStatus] = useState("");
  const [getGameId, setGetGameId] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [ongoingGames, setOngoingGames] = useState(null);
  const [closedGames, setClosedGames] = useState([]);
  const [showClosed, setShowClosed] = useState(false);

  const { colorMode } = useColorMode();
  const toast = useToast();

  function addHwangMarketListener() {
    console.log("hwang market game created listener added");
    const g1 = hwangMarket.events
      .GameCreated({}, (error, data) => {
        if (error) {
          setStatus("😥 Cannot connect to the network");
          console.log(error.message);
          setLoading(false);
        }
      })
      .on("data", (data) => {
        if (data && data.returnValues && data.returnValues.gameMetadata) {
          toast({
            title: "New game created!",
            description: `${data.returnValues.gameMetadata.title}`,
            status: "success",
            duration: 8000,
            isClosable: true,
          });
          setOngoingGames((prev) => [...prev, data.returnValues.gameMetadata]);
          // setStatus("🎉 Your game was created!");
        }
      });

    setGC1((prev) => {
      prev && prev.removeAllListeners("data");
      return g1;
    });

    hwangMarket.events.GameConcluded({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const games = await getAllGames();
        setOngoingGames(games.ongoingGames);
        setClosedGames(games.closedGames);
      }
    });
  }

  useEffect(() => {
    addHwangMarketListener();
    setLoading(true);
    async function getGames() {
      try {
        const games = await getAllGames();
        setOngoingGames(games.ongoingGames);
        setClosedGames(games.closedGames);
      } catch {
        setStatus("😥 Cannot connect to the network");
      }
      setLoading(false);
    }
    getGames();
  }, []);

  return (
    <Box px="28" py="7">
      <Heading size="2xl" textAlign="center">
        Markets Gallery
      </Heading>
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        columnGap="10"
        mt="7"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          columnGap="2"
          rowGap="2"
        >
          <Text>Show closed games:</Text>
          <Switch
            colorScheme="teal"
            size="lg"
            isChecked={showClosed}
            onChange={() => setShowClosed((prev) => !prev)}
          />
        </Box>
        <Text
          px="4"
          py="2"
          border={colorMode === "light" ? "1px solid black" : "1px solid white"}
          borderRadius="10px"
        >
          Number of open games: {ongoingGames ? ongoingGames.length : 0}
        </Text>
        <CreateGame walletAddress={walletAddress} setStatus={setStatus} />
      </Box>

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
          <Spinner size="lg" color="red.500" />
        ) : status ? (
          <Heading>{status}</Heading>
        ) : ongoingGames && ongoingGames.length > 0 ? (
          ongoingGames
            .slice()
            .reverse()
            .map((g) => <GameCard key={g.addr} game={g} />)
        ) : (
          <Box>
            <Text fontSize="3xl">
              No open games, create one to get started!
            </Text>
          </Box>
        )}

        <Divider />
        {showClosed &&
          (closedGames && closedGames.length > 0 ? (
            closedGames
              .slice()
              .reverse()
              .map((g) => <GameCard key={g.addr} game={g} />)
          ) : (
            <Text fontSize="3xl">No closed games!</Text>
          ))}
      </Box>
    </Box>
  );
};

export default GamesGallery;
