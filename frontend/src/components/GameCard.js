import { Box, Button, Heading, Text, useColorMode } from "@chakra-ui/react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ProgressBar from "@ramonak/react-progress-bar";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      let perc = Math.min(
        Math.floor(
          ((Date.now() / 1000 - game.createdTime) /
            (game.resolveTime - game.createdTime)) *
            100
        ),
        100
      );
      if (perc < 0) {
        perc = 100;
      }
      setPercentage(perc);

      const timeLeft = Math.max(
        0,
        Math.floor(game.resolveTime - Date.now() / 1000)
      );
      let s = "";
      if (timeLeft === 0) {
        setDiffText("Closed");
      } else if (timeLeft < 60) {
        if (timeLeft > 1) {
          s = "s";
        }
        setDiffText(`${timeLeft} second${s}`);
      } else if (timeLeft < 60 * 60) {
        if (Math.max(1, Math.floor(timeLeft / 60)) > 1) {
          s = "s";
        }
        setDiffText(`${Math.max(1, Math.floor(timeLeft / 60))} minute${s}`);
      } else if (timeLeft < 24 * 60 * 60) {
        if (Math.max(1, Math.floor(timeLeft / (60 * 60))) > 1) {
          s = "s";
        }
        setDiffText(
          `${Math.max(1, Math.floor(timeLeft / (60 * 60)))} hour${s}`
        );
      } else {
        setDiffText(">24 hours");
      }
    }, 1000);

    return () => clearInterval(intervalId); //This is important
  }, [game.createdTime, game.resolveTime]);

  const naviate = useNavigate();
  const totalSupply = 1000; // hardcoded 1000 token supply limit
  return (
    <Box w="40%" display="flex" justifyContent="center">
      <Box
        w="100%"
        border={colorMode === "light" ? "1px solid black" : "1px solid gray"}
        borderRadius="15px"
        bgColor={colorMode === "light" ? "telegram.100" : "facebook.700"}
        _hover={{
          // background: colorMode === "light" ? "facebook.200" : "facebook.800",
          // cursor: "pointer",
          // borderColor: "facebook.200",
          boxShadow: "3px 6px #888888",
        }}
      >
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          px="5"
          py="8"
          columnGap="5"
        >
          <Box w="80px" minW="80px" h="65px" minH="65px" p="0.5" mr="4">
            <CircularProgressbar
              value={percentage}
              text={diffText}
              styles={buildStyles({
                textSize: "16px",
                textColor: colorMode === "light" ? "black" : "white",
                trailColor: colorMode === "light" ? "#718096" : "#d6d6d6",
                pathColor: colorMode === "light" ? "#38B2AC" : "#3182CE",
              })}
              strokeWidth={10}
            />
          </Box>
          <Heading size="md">{game.title}</Heading>
          <Button
            ml="auto"
            colorScheme="telegram"
            borderRadius="15px"
            onClick={() => naviate(`/${game.id}`)}
            minW="80px"
            variant="outline"
          >
            Details
          </Button>
        </Box>

        <Box display="flex">
          <Box px="5" py="2" textAlign="center" mr="1">
            <Text fontSize="md">Total bets</Text>
            <Text fontSize="lg" fontWeight="bold">
              {game.totalAmount} HMTKN
            </Text>
          </Box>
          <Box pb="5" pt="1" mx="auto" w="450px" maxW="65%">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-evenly"
              columnGap="3"
              py="1.5"
            >
              <Heading size="md" w="40px">
                Yes
              </Heading>
              <Box w="100%" maxW="100%">
                <ProgressBar
                  completed={Math.floor(game.betYesAmount / totalSupply) * 100}
                  maxCompleted={100}
                  bgColor={colorMode === "light" ? "#63B3ED" : "#2B6CB0"}
                  baseBgColor={colorMode === "light" ? "#4A5568" : "#EBF8FF"}
                  customLabel={`${game.betYesAmount} HMTKN`}
                  width="100%"
                  labelSize="14px"
                  height="30px"
                />
              </Box>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-evenly"
              columnGap="3"
              py="1.5"
            >
              <Heading size="md" w="40px">
                No
              </Heading>
              <Box w="100%" maxW="100%">
                <ProgressBar
                  completed={Math.floor(game.betNoAmount / totalSupply) * 100}
                  maxCompleted={100}
                  bgColor={colorMode === "light" ? "#63B3ED" : "#2B6CB0"}
                  baseBgColor={colorMode === "light" ? "#4A5568" : "#EBF8FF"}
                  customLabel={`${game.betNoAmount} HMTKN`}
                  width="100%"
                  labelSize="14px"
                  height="30px"
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default GameCard;
