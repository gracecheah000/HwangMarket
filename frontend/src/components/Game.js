import { Box, Heading, Text, useColorMode } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGameById } from "../util/interact";
import { PieChart } from "react-minimal-pie-chart";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function Game() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  useEffect(() => {
    getGameById(id, setGame);
  }, [id]);

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
  }, [game && game.createdTime, game && game.resolveTime]);

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

  const lineWidth = 60;

  return (
    <Box p="16">
      {game ? (
        <Box
          display="flex"
          justifyContent="space-evenly"
          border="1px solid red"
        >
          <Box maxW="600px">
            <Heading>{game.title}</Heading>
            <Box
              display="flex"
              justifyContent="space-evenly"
              alignItems="center"
              my="8"
            >
              <Box>
                <Text>Total Amount</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {game.totalAmount} HMTKN
                </Text>
              </Box>
              <Box>
                <PieChart
                  style={{
                    fontFamily:
                      '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
                    fontSize: "8px",
                  }}
                  data={[
                    {
                      title: "Yes",
                      value: parseInt(game.betTotalAmount)
                        ? parseInt(game.betYesAmount)
                        : 1,
                      color: "#48BB78",
                    },
                    {
                      title: "No",
                      value: parseInt(game.betTotalAmount)
                        ? parseInt(game.betNoAmount)
                        : 1,
                      color: "#E53E3E",
                    },
                  ]}
                  radius={50}
                  lineWidth={60}
                  segmentsStyle={{
                    transition: "stroke .3s",
                    cursor: "pointer",
                  }}
                  animate
                  label={({ dataEntry }) => dataEntry.title}
                  labelPosition={100 - lineWidth / 2}
                  labelStyle={{
                    fill: "#fff",
                    opacity: 0.75,
                    pointerEvents: "none",
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDir="column"
            alignItems="center"
            border="1px solid white"
            justifyContent="center"
            w="20%"
            maxW="400px"
          >
            <Box w="full" textAlign="center">
              <Box display="flex">
                <Text fontSize="3xl" fontWeight="bold">
                  Resolution Time:
                </Text>
                {/* <Timestamp date={Date} /> */}
              </Box>
              <CircularProgressbar
                value={percentage}
                text={diffText}
                styles={buildStyles({
                  textSize: "14px",
                  textColor: colorMode === "light" ? "black" : "white",
                })}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Text>Loading..</Text>
      )}
    </Box>
  );
}
