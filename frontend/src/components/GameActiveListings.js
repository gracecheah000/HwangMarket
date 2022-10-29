import { Box, Button, Heading, useColorMode } from "@chakra-ui/react";
import {
  faPlus,
  faPlusCircle,
  faPlusSquare,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { gameContractABI, web3 } from "../util/interact";
import ListingTable from "./ListingTable";

export default function GameActiveListings({ game, setIsDialog, onOpen }) {
  // useEffect(() => {
  //   getGameTrxs(gameAddr, setGameTrxs);
  // }, [gameAddr]);
  const [openListings, setOpenListings] = useState([]);
  const [closedListings, setClosedListings] = useState([]);
  const gameContract = new web3.eth.Contract(gameContractABI, game.addr);

  const addPlayerJoinedGameListener = () => {
    console.log("game new listing listener added");

    gameContract.events.NewListing({}, (error, data) => {
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
      }
    });
  };

  useEffect(() => {
    addPlayerJoinedGameListener();
    async function getAllListings() {
      const listings = await gameContract.methods.getAllListings().call();
      console.log("listings loaded in", listings);
      setOpenListings(listings.filter((l) => !l.fulfilled));
      setClosedListings(listings.filter((l) => l.fulfilled));
    }
    getAllListings();
  }, []);

  const { colorMode } = useColorMode();

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
      <ListingTable listings={openListings} />
    </Box>
  );
}
