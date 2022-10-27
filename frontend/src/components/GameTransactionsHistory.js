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
} from "@chakra-ui/react";
import { getGameTrxs } from "../util/interact";
import { shortenAddr } from "../util/helper";

export default function GameTransactionsHistory({ game }) {
  const [gameTrxs, setGameTrxs] = useState([]);
  /*
    [
      '7',
      'BET',
      '60',
      '1666798762',
      '1',
      '0x24b75f97c20Fa56753FE70CfAD530113a3d0BdA7',
      '0xd3cb011Ab2F1D45610e5e3da1D6372bC7C787923',
      trxId: '7',
      activityType: 'BET',
      trxAmt: '60',
      trxTime: '1666798762',
      gameSide: '1',
      from: '0x24b75f97c20Fa56753FE70CfAD530113a3d0BdA7',
      to: '0xd3cb011Ab2F1D45610e5e3da1D6372bC7C787923'
    ]
  */

  useEffect(() => {
    getGameTrxs(game.addr, setGameTrxs);
  }, [game]);

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
                .map((trx) => (
                  <Tr key={trx.trxId}>
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
