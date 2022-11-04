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
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import {
  faArrowRight,
  faLineChart,
  faPlus,
  faPlusCircle,
  faPlusSquare,
  faQuestion,
  faStop,
  faStopCircle,
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
  setIsCreate,
  setListingSelected,
}) {
  // useEffect(() => {
  //   getGameTrxs(gameAddr, setGameTrxs);
  // }, [gameAddr]);
  const [openListings, setOpenListings] = useState([]);
  const [bgColor, setBgColor] = useState("");
  const [closedListings, setClosedListings] = useState([]);
  const [gntPrice, setGntPrice] = useState([1, 1]);
  const [gytPrice, setGytPrice] = useState([1, 1]);
  const [delListing, setDelListing] = useState(null);

  const { colorMode } = useColorMode();

  const addNewListingListener = () => {
    if (!game || !game.addr || !gytAddr || !gntAddr) {
      return;
    }
    console.log("game new listing listener added");
    const gameContract = new web3.eth.Contract(gameContractABI, game.addr);
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

  const addListingFulfilledListener = async () => {
    if (!game || !game.addr || !gytAddr || !gntAddr) {
      return;
    }
    console.log("listing fulfilled listener added");
    const gameContract = await new web3.eth.Contract(
      gameContractABI,
      game.addr
    );
    gameContract.events.ListingFulfilled({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues.listingInfo;
        // let it shine red for 1.5s
        setDelListing(details);
        // trigger rerender
        setOpenListings((prev) =>
          prev.map((ol) => (ol.listingId === details.listingId ? details : ol))
        );

        if (details.token2.toLowerCase() === hmtknAddr.toLowerCase()) {
          if (details.token1.toLowerCase() === gytAddr.toLowerCase()) {
            setGytPrice((prev) => {
              console.log("new", [
                prev[1],
                +(
                  Number(details.token2Amt) / Number(details.token1Amt)
                ).toFixed(2),
              ]);
              return [
                prev[1],
                +(
                  Number(details.token2Amt) / Number(details.token1Amt)
                ).toFixed(2),
              ];
            });
          } else if (details.token1.toLowerCase() === gntAddr.toLowerCase()) {
            setGntPrice((prev) => {
              console.log("new", [
                prev[1],
                +(
                  Number(details.token2Amt) / Number(details.token1Amt)
                ).toFixed(2),
              ]);
              return [
                prev[1],
                +(
                  Number(details.token2Amt) / Number(details.token1Amt)
                ).toFixed(2),
              ];
            });
          }
        }

        await sleep(1000);

        setOpenListings((prev) =>
          prev.filter((ol) => ol.listingId !== details.listingId)
        );
        setClosedListings((prev) => [...prev, details]);
        setDelListing(null);
      }
    });
  };

  useEffect(() => {
    addNewListingListener();
    addListingFulfilledListener();
  }, [game && game.addr, gytAddr, gntAddr]);

  useEffect(() => {
    async function getAllListings() {
      console.log("get all listings...");
      if (!game || !game.addr) {
        return;
      }
      const gameContract = new web3.eth.Contract(gameContractABI, game.addr);
      const listings = await gameContract.methods.getAllListings().call();
      setOpenListings(listings.filter((l) => !l.fulfilled));
      const closed = listings.filter((l) => l.fulfilled);

      setClosedListings(closed);
      const closedGyt = closed.filter(
        (l) =>
          l.token1.toLowerCase() === gytAddr.toLowerCase() &&
          l.token2.toLowerCase() === hmtknAddr.toLowerCase()
      );
      closedGyt.sort(
        (x, y) => parseInt(y.fulfilledTime) - parseInt(x.fulfilledTime)
      );

      setGytPrice([
        closedGyt.length > 1
          ? +(
              Number(closedGyt[1].token2Amt) / Number(closedGyt[1].token1Amt)
            ).toFixed(2)
          : 1,
        closedGyt.length > 0
          ? +(
              Number(closedGyt[0].token2Amt) / Number(closedGyt[0].token1Amt)
            ).toFixed(2)
          : 1,
      ]);

      const closedGnt = closed.filter(
        (l) =>
          l.token1.toLowerCase() === gntAddr.toLowerCase() &&
          l.token2.toLowerCase() === hmtknAddr.toLowerCase()
      );
      closedGnt.sort(
        (x, y) => parseInt(y.fulfilledTime) - parseInt(x.fulfilledTime)
      );
      setGntPrice([
        closedGnt.length > 1
          ? +(
              Number(closedGnt[1].token2Amt) / Number(closedGnt[1].token1Amt)
            ).toFixed(2)
          : 1,
        closedGnt.length > 0
          ? +(
              Number(closedGnt[0].token2Amt) / Number(closedGnt[0].token1Amt)
            ).toFixed(2)
          : 1,
      ]);
    }
    getAllListings();
  }, [game && game.addr, hmtknAddr, gytAddr, gntAddr]);

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
    <Box>
      <Box display="flex" columnGap="16" mb="5">
        <Box>
          <Heading size="md">Insights</Heading>
          <FontAwesomeIcon icon={faLineChart} />
        </Box>
        <StatGroup w="100%">
          <Stat size="xs">
            <StatLabel>GYT Price</StatLabel>
            <StatNumber>{gytPrice[1]} HMTKN</StatNumber>
            <StatHelpText>
              {gytPrice[0] !== gytPrice[1] ? (
                <StatArrow
                  type={gytPrice[1] > gytPrice[0] ? "increase" : "decrease"}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faArrowRight}
                  style={{ marginRight: "5px" }}
                />
              )}
              Prev: {gytPrice[0]} HMTKN
            </StatHelpText>
          </Stat>

          <Stat size="xs">
            <StatLabel>GNT Price</StatLabel>
            <StatNumber>{gntPrice[1]} HMTKN</StatNumber>
            <StatHelpText>
              {gntPrice[0] !== gntPrice[1] ? (
                <StatArrow
                  type={gntPrice[1] > gntPrice[0] ? "increase" : "decrease"}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faArrowRight}
                  style={{ marginRight: "5px" }}
                />
              )}
              Prev: {gntPrice[0]} HMTKN
            </StatHelpText>
          </Stat>
        </StatGroup>
      </Box>

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
            setIsCreate(true);
            onOpen();
          }}
        >
          Create Listing
        </Button>
      </Box>
      <TableContainer overflowY="scroll" maxH="60vh">
        <Table variant="simple" size="sm">
          <TableCaption>
            For convenience, GYT and GNT tokens refer to this game's tokens.
            Other game's tokens are referred to by their address.
          </TableCaption>
          <Thead>
            <Tr>
              <Th>Created time</Th>
              <Th>Bid</Th>
              <Th>Ask</Th>
              <Th>Info</Th>
            </Tr>
          </Thead>
          <Tbody>
            {openListings && openListings.length > 0 ? (
              openListings
                .slice()
                .reverse()
                .map((ol, i) => (
                  <Tr
                    key={`${ol.listingId}`}
                    bgColor={
                      delListing && delListing.listingId === ol.listingId
                        ? colorMode === "light"
                          ? "#FED7D7"
                          : "#822727"
                        : i === 0
                        ? bgColor
                        : ""
                    }
                  >
                    <Td>
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        timeZoneName: "short",
                      }).format(parseInt(ol.createdTime) * 1000)}
                    </Td>
                    <Td fontWeight="bold">
                      {ol.token1Amt} {parseAddr(ol.token1)}
                    </Td>
                    <Td fontWeight="bold">
                      {ol.token2Amt} {parseAddr(ol.token2)}
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="telegram"
                        variant="outline"
                        onClick={() => {
                          setIsCreate(false);
                          setIsDialog(false);
                          setListingSelected(ol);
                          onOpen();
                        }}
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
