import { Box, Text } from "@chakra-ui/react";
import React from "react";

const GameCard = ({ game }) => {
  /*
  addr: "0x64C3bb915Dd98231B3b2649A350B28d746a087Af"
  betNoAmount: "0"
  betYesAmount: "0"
  createdTime: "1666719306"
  gameOutcome: "0"
  id: "2"
  ongoing: true
  oracleAddr: "0x0d79df66BE487753B02D015Fb622DED7f0E9798d"
  resolveTime: "1666722600"
  tag: "Price Feeds"
  threshold: "200000000000"
  title: "Hello world!"
  totalAmount: "0"
  */
  return (
    <Box w="40%" display="flex" justifyContent="center">
      <Box border="1px solid white" borderRadius="15px" p="12">
        <Text>
          {game.addr} + {game.title}
        </Text>
      </Box>
    </Box>
  );
};

export default GameCard;
