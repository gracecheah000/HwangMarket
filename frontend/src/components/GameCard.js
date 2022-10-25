import { Box, Heading, Text, useColorMode } from "@chakra-ui/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import React, { useEffect, useState } from "react";

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

  const [percentage, setPercentage] = useState(0);
  const [diffText, setDiffText] = useState("");

  const { colorMode } = useColorMode();

  useEffect(() => {
    const intervalId = setInterval(() => {
      //assign interval to a variable to clear it.
      setPercentage(
        Math.max(
          1,
          Math.min(
            Math.floor(
              ((Date.now() / 1000 - game.createdTime) /
                (game.resolveTime - game.createdTime)) *
                100
            ),
            100
          )
        )
      );

      const timeLeft = Math.max(0, game.resolveTime - Date.now() / 1000);

      let s = "";
      if (timeLeft === 0) {
        setDiffText("Closed");
      } else if (timeLeft < 60) {
        if (timeLeft > 1) {
          s = "s";
        }
        setDiffText(`${timeLeft} second${s}`);
      } else if (timeLeft < 60 * 60) {
        if (timeLeft > 60) {
          s = "s";
        }
        setDiffText(`${Math.floor(timeLeft / 60)} minute${s}`);
      } else if ((timeLeft < 24 * 60) & 60) {
        if (timeLeft > 60 * 60) {
          s = "s";
        }
        setDiffText(`${Math.floor(timeLeft / (60 * 60))} hour${s}`);
      } else {
        setDiffText(">24 hours");
      }
    }, 1000);

    return () => clearInterval(intervalId); //This is important
  }, [game.createdTime, game.resolveTime]);

  return (
    <Box w="40%" display="flex" justifyContent="center">
      <Box
        w="100%"
        border={colorMode === "light" ? "1px solid black" : "1px solid white"}
        borderRadius="15px"
        p="12"
      >
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          px="5"
          columnGap="5"
        >
          <Box w="70px" minW="70px" h="50px" minH="50px">
            <CircularProgressbar
              value={percentage}
              text={diffText}
              styles={buildStyles({
                textSize: "15px",
                textColor: colorMode === "light" ? "black" : "white",
              })}
            />
          </Box>
          <Heading size="md">{game.title}</Heading>
        </Box>
      </Box>
    </Box>
  );
};

export default GameCard;
