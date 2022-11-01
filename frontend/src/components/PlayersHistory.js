import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Button,
  Tag,
  useColorMode,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { shortenAddr } from "../util/helper";
import { getPlayersTrxRecords } from "../util/interact";

export default function PlayersHistory({ wallet }) {
  const [records, setRecords] = useState([]);

  const { colorMode } = useColorMode();

  useEffect(() => {
    const getRecords = async () => {
      setRecords(await getPlayersTrxRecords(wallet));
    };
    getRecords();
  }, [wallet]);

  return (
    <Box pt="8" pb="16" px="5" m="8" mx="16">
      <Heading size="lg" mb="10">
        Transaction History
      </Heading>
      <TableContainer>
        <Table variant="striped" size="sm">
          <TableCaption>
            Your BET and WITHDRAW transactions from HMTKN to Game Tokens
          </TableCaption>
          <Thead>
            <Tr>
              <Th>Activity Type</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th isNumeric>Transaction Amount</Th>
              <Th>Transaction Game side</Th>
              <Th>Transaction Timestamp</Th>
            </Tr>
          </Thead>
          <Tbody>
            {records && records.length > 0 ? (
              records.map((r) => (
                <Tr>
                  <Td>
                    <Badge
                      variant="outline"
                      colorScheme={r.activityType === "BET" ? "teal" : "pink"}
                    >
                      {r.activityType}
                    </Badge>
                  </Td>
                  <Td>
                    <Popover>
                      <PopoverTrigger>
                        <Tag
                          _hover={{ cursor: "pointer" }}
                          variant="outline"
                          color={colorMode === "light" ? "black" : "white"}
                        >
                          {shortenAddr(r.from)}
                        </Tag>
                      </PopoverTrigger>
                      <PopoverContent
                        minW={{ base: "100%", lg: "max-content" }}
                      >
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Address</PopoverHeader>
                        <PopoverBody>{r.from}</PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Td>
                  <Td>
                    <Popover>
                      <PopoverTrigger>
                        <Tag
                          _hover={{ cursor: "pointer" }}
                          variant="outline"
                          color={colorMode === "light" ? "black" : "white"}
                        >
                          {shortenAddr(r.to)}
                        </Tag>
                      </PopoverTrigger>
                      <PopoverContent
                        minW={{ base: "100%", lg: "max-content" }}
                      >
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Address</PopoverHeader>
                        <PopoverBody>{r.to}</PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Td>
                  <Td isNumeric>{r.trxAmt}</Td>
                  <Td>
                    {r.gameSide === "1" ? (
                      <Badge colorScheme="whatsapp" variant="outline">
                        Yes
                      </Badge>
                    ) : (
                      <Badge colorScheme="red" variant="outline">
                        No
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZoneName: "short",
                    }).format(parseInt(r.trxTime) * 1000)}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td>-</Td>
                <Td>-</Td>
                <Td>-</Td>
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
