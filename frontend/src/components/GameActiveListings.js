import {
  Box,
  Button,
  Heading,
  useColorMode,
  Text,
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
} from "@chakra-ui/react";
import {
  faPlus,
  faPlusCircle,
  faPlusSquare,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { shortenAddr, sleep } from "../util/helper";
import { gameContractABI, web3 } from "../util/interact";

export default function GameActiveListings({
  game,
  setIsDialog,
  onOpen,
  gytAddr,
  gntAddr,
  hmtknAddr,
}) {
  // useEffect(() => {
  //   getGameTrxs(gameAddr, setGameTrxs);
  // }, [gameAddr]);
  const [openListings, setOpenListings] = useState([]);
  const [bgColor, setBgColor] = useState("");
  const [closedListings, setClosedListings] = useState([]);
  const gameContract = new web3.eth.Contract(gameContractABI, game.addr);

  const addNewListingListener = () => {
    console.log("game new listing listener added");

    gameContract.events.NewListing({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues.listingInfo;
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
        console.log("details from game token listing listener", details);
        if (!details.fulfilled) {
          setOpenListings((prev) => [...prev, details]);
        } else {
          setClosedListings((prev) => [...prev, details]);
        }
        setBgColor(colorMode === "light" ? "#9AE6B4" : "#22543D");
        await sleep(1500);
        // reset back to normal color
        setBgColor("");
      }
    });
  };

  useEffect(() => {
    addNewListingListener();
    async function getAllListings() {
      const listings = await gameContract.methods.getAllListings().call();
      console.log("listings loaded in", listings);
      setOpenListings(listings.filter((l) => !l.fulfilled));
      setClosedListings(listings.filter((l) => l.fulfilled));
    }
    getAllListings();
  }, []);

  const { colorMode } = useColorMode();

  const parseAddr = (addr) => {
    return addr === gntAddr
      ? "GNT"
      : addr === gytAddr
      ? "GYT"
      : addr === hmtknAddr
      ? "HMTKN"
      : shortenAddr(addr);
  };

  return (
    <Box
    // border="1px solid"
    // borderColor={colorMode === "light" ? "gray" : "white"}
    // borderRadius="21px"
    >
      <Box
        mb="5"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading fontSize="xl">Open Listings</Heading>
        <Button
          leftIcon={
            <FontAwesomeIcon style={{ marginLeft: "6px" }} icon={faPlus} />
          }
          size="sm"
          colorScheme="teal"
          variant="outline"
          onClick={() => {
            setIsDialog(false);
            onOpen();
          }}
        >
          Create Listing
        </Button>
      </Box>
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
            {openListings && openListings.length > 0 ? (
              openListings
                .slice()
                .reverse()
                .map((ol, i) => (
                  <Tr key={ol.listingId} bgColor={i === 0 ? bgColor : ""}>
                    <Td fontWeight="bold">{parseAddr(ol.token1)}</Td>
                    <Td>{ol.token1Amt}</Td>
                    <Td fontWeight="bold">{parseAddr(ol.token2)}</Td>
                    <Td>{ol.token2Amt}</Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="telegram"
                        variant="outline"
                      >
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
    </Box>
  );
}
