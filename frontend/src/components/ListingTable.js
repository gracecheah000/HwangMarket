import React from "react";
import {
  Box,
  Heading,
  Text,
  useColorMode,
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
  Button,
} from "@chakra-ui/react";
import { shortenAddr } from "../util/helper";

export default function ListingTable({ listings }) {
  /*
    fulfilled: false
    listingAddr: "0xD2be281e9379F56fDB84C61973a6b341f495106F"
    listingId: "0"
    player1: "0xc55De8931433adB28eE7767782E716dD00F7DEd9"
    player2: "0x0000000000000000000000000000000000000000"
    token1: "0x2063eE55A823B9F80DB2Ee5Ef503abbC44347eeD"
    token1Amt: "100"
    token2: "0x1AB8b37A77DC9563190f1058AD72f00aa2698d96"
    token2Amt: "150"
  */
  return (
    <TableContainer overflowY="scroll" maxH="60vh">
      <Table variant="simple" size="sm">
        <TableCaption>Open listings logged in game contract</TableCaption>
        <Thead>
          <Tr>
            <Th>Offered Token</Th>
            <Th>Offered Amount</Th>
            <Th>Expecting Token</Th>
            <Th>Expecting Amount</Th>
            <Th>Info</Th>
          </Tr>
        </Thead>
        <Tbody>
          {listings && listings.length > 0 ? (
            listings.map((ol) => (
              <Tr key={ol.listingId}>
                <Td>{shortenAddr(ol.token1)}</Td>
                <Td>{ol.token1Amt}</Td>
                <Td>{shortenAddr(ol.token2)}</Td>
                <Td>{ol.token2Amt}</Td>
                <Td>
                  <Button size="sm" colorScheme="telegram" variant="outline">
                    Details
                  </Button>
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
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
