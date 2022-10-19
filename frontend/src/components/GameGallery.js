import React, { useEffect, useState } from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { hwangMarket, createAGame } from "../util/interact";

const GamesGallery = () => {
  const [status, setStatus] = useState("");
  const [gamesAddr, setGamesAddr] = useState([]);

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

  useEffect(() => {
    addHwangMarketListener();
  }, []);

  return (
    <Box border="1px solid red">
      <Heading>Games Gallery</Heading>
      <Text>{status}</Text>
      Number of games: {gamesAddr.length}
      {gamesAddr && gamesAddr.map((g) => <Text>{g}</Text>)}
    </Box>
  );
};

export default GamesGallery;
