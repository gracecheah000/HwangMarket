import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Tfoot,
  Badge,
  Tooltip,
  Tag,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { getGameTrxsByAddr, hwangMarket } from "../util/interact";
import { shortenAddr, sleep } from "../util/helper";

export default function GameTransactionsHistory({ gameAddr, setPJL2 }) {
  const [gameTrxs, setGameTrxs] = useState([]);
  const [bgColor, setBgColor] = useState("");
  const { colorMode } = useColorMode();
  /*
    [
      amount: "1"
      betSide: "1"
      gameAddr: "0x439AB69D18De2aDEdBdde92146FDC14a155F3f8b"
      gameId: "1"
      player: "0xb50b7E6629901979580a440B8C066122506Ed"
    ]
  */

  const addPlayerJoinedGameListener = () => {
    console.log("hwang market player joined game listener added");
    const l = hwangMarket.events
      .PlayerJoinedGameEvent({}, (error, data) => {
        if (error) {
          console.log("listener error:", error);
        }
      })
      .on("data", async (data) => {
        const details = data.returnValues;
        setGameTrxs((prev) => [
          ...prev,
          {
            ...details,
            to: details.player,
            from: gameAddr,
            trxAmt: details.amount,
            gameSide: details.betSide,
          },
        ]);
        let color = "";
        if (details.betSide === "1") {
          color = colorMode === "light" ? "#9AE6B4" : "#22543D";
        } else {
          color = colorMode === "light" ? "#FED7D7" : "#822727";
        }
        setBgColor(color);
        await sleep(1500);
        // reset back to normal color
        setBgColor("");
      });

    setPJL2((prev) => {
      prev && prev.removeAllListeners("data");
      return l;
    });
  };

  useEffect(() => {
    const updateTrxs = async () => {
      const trxs = await getGameTrxsByAddr(gameAddr);
      setGameTrxs(trxs);
    };
    updateTrxs();
    addPlayerJoinedGameListener();
  }, [colorMode, gameAddr]);

  return (
    <Box>
      <Heading my="5" fontSize="xl">
        Latest Transactions
      </Heading>
      <TableContainer overflowY="scroll" maxH="60vh">
        <Table variant="simple">
          <TableCaption>Transactions logged in game contract</TableCaption>
          <Thead>
            <Tr>
              <Th>Address</Th>
              <Th>Amount (in HMTKN)</Th>
              <Th>Prediction</Th>
            </Tr>
          </Thead>
          <Tbody>
            {gameTrxs && gameTrxs.length > 0 ? (
              gameTrxs
                .slice()
                .reverse()
                .map((trx, i) => (
                  <Tr key={i} bgColor={i === 0 ? bgColor : ""}>
                    <Td>
                      <Popover>
                        <PopoverTrigger>
                          <Tag _hover={{ cursor: "pointer" }}>
                            {shortenAddr(trx.to)}
                          </Tag>
                        </PopoverTrigger>
                        <PopoverContent
                          minW={{ base: "100%", lg: "max-content" }}
                        >
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader>Player Address</PopoverHeader>
                          <PopoverBody>
                            <Box>
                              <Text fontSize="sm">{trx.to}</Text>
                            </Box>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Td>
                    <Td>{trx.trxAmt}</Td>
                    <Td>
                      {trx.gameSide === "1" ? (
                        <Badge colorScheme="green" variant="outline">
                          Yes
                        </Badge>
                      ) : (
                        <Badge colorScheme="red" variant="outline">
                          No
                        </Badge>
                      )}
                    </Td>
                  </Tr>
                ))
            ) : (
              <Tr>
                <Td>-</Td>
                <Td>-</Td>
                <Td>-</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
