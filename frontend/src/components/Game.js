import {
  Box,
  Heading,
  Text,
  useColorMode,
  Link,
  Tooltip,
  Badge,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  Button,
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getGameById,
  hwangMarket,
  mintGameTokenFromMainToken,
  getMainToken2SenderApprovalAmt,
} from "../util/interact";
import { PieChart } from "react-minimal-pie-chart";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleQuestion,
  faExternalLink,
  faQuestion,
  faQuestionCircle,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import GameTransactionsHistory from "./GameTransactionsHistory";
import GameActiveListings from "./GameActiveListings";
import GameErrorDialog from "./GameDialogs/GameErrorDialog";
import PurchaseConfirmationDialog from "./GameDialogs/PurchaseConfirmationDialog";
import IncreaseAllowanceDialog from "./GameDialogs/IncreaseAllowanceDialog";
import { game2MainConversionRate, shortenAddr } from "../util/helper";

export default function Game({ wallet }) {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  useEffect(() => {
    getGameById(id, setGame);
  }, [id]);

  const [percentage, setPercentage] = useState(0);
  const [diffText, setDiffText] = useState("");
  const [buyTokenSide, setBuyTokenSide] = useState("0");
  const [buyTokenAmt, setBuyTokenAmt] = useState(1);
  const [maxLimit, setMaxLimit] = useState(1000);
  const [purchaseTrxHash, setPurchaseTrxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [main2TknAllowance, setMain2TknAllowance] = useState(0);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const { colorMode } = useColorMode();

  const triggerPurchase = async () => {
    const { trxHash, err } = await mintGameTokenFromMainToken(
      wallet,
      game ? game.addr : "",
      buyTokenSide,
      buyTokenAmt,
      maxLimit
    );
    if (trxHash) {
      setPurchaseTrxHash(trxHash);
    } else {
      setErrorMsg(err);
    }
    setBuyTokenSide("0");
    setBuyTokenAmt(0);
    onOpen();
  };

  const addPlayerJoinedGameListener = () => {
    console.log("hwang market player joined game listener added");
    hwangMarket.events.PlayerJoinedGameEvent({}, (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues;
        if (details.betSide === "1") {
          setGame((prev) => {
            const copy = JSON.parse(JSON.stringify(prev));
            copy.betYesAmount =
              parseInt(copy.betYesAmount) + parseInt(details.amount);
            return copy;
          });
        } else {
          setGame((prev) => {
            const copy = JSON.parse(JSON.stringify(prev));
            copy.betNoAmount =
              parseInt(copy.betNoAmount) + parseInt(details.amount);
            return copy;
          });
        }
      }
    });
  };

  useEffect(() => {
    const updateAllowance = async () => {
      setMain2TknAllowance(
        await getMainToken2SenderApprovalAmt(wallet, game && game.addr)
      );
    };
    updateAllowance();
  }, [wallet, game]);

  useEffect(() => {
    addPlayerJoinedGameListener();
  }, []);

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
  }, [game]);

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
    <Box m="8" mx="16">
      {game ? (
        <Box
          pt="8"
          pb="16"
          px="5"
          border={colorMode === "light" ? "1px solid gray" : "1px solid white"}
          borderRadius="30px"
        >
          <Box
            display="flex"
            justifyContent="space-evenly"
            flexWrap="wrap"
            rowGap="3"
          >
            <Box maxW="650px">
              <Heading>{game.title}</Heading>
              <Badge mt="2" colorScheme="green" variant="solid">
                {game.tag}
              </Badge>
              <Box
                display="flex"
                justifyContent="space-evenly"
                alignItems="center"
                my="8"
              >
                <Box>
                  <Box textAlign="center">
                    <Stat size="sm">
                      <StatLabel>Total Amount</StatLabel>
                      <StatNumber>{game.totalAmount} HMTKN</StatNumber>
                    </Stat>
                  </Box>
                  <Box
                    my="5"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    columnGap="8"
                  >
                    <Box>
                      <Stat size="sm">
                        <StatLabel>Total Yes Amount</StatLabel>
                        <StatNumber>{game.betYesAmount} HMTKN</StatNumber>
                      </Stat>
                    </Box>
                    <Box>
                      <Stat size="sm">
                        <StatLabel>Total No Amount</StatLabel>
                        <StatNumber>{game.betNoAmount} HMTKN</StatNumber>
                      </Stat>
                    </Box>
                  </Box>
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
                        title: "No",
                        value: Math.max(1, parseInt(game.betNoAmount)),
                        color: "#E53E3E",
                      },
                      {
                        title: "Yes",
                        value: Math.max(1, parseInt(game.betYesAmount)),
                        color: "#48BB78",
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

              <Box
                display="flex"
                justifyContent="flex-start"
                alignItems="center"
                columnGap="5"
                bgColor={colorMode === "light" ? "cyan.100" : "blue.900"}
                borderRadius="25px"
                // p="8"
                px="5"
                py="7"
                border={
                  colorMode === "light" ? "1px solid gray" : "1px solid white"
                }
              >
                <Box whiteSpace="nowrap">
                  <Text>Game outcome:</Text>
                  <Text>Contract creation time:</Text>
                  <Text>Contract address:</Text>
                  <Text>Oracle address:</Text>
                  <Text>Threshold for resolution:</Text>
                </Box>
                <Box>
                  <Badge
                    fontSize="1em"
                    variant="outline"
                    colorScheme={
                      game.gameOutcome === "0"
                        ? "purple"
                        : game.gameOutcome === "1"
                        ? "green"
                        : "red"
                    }
                  >
                    {game.gameOutcome === "0"
                      ? "TBD"
                      : game.gameOutcome === "1"
                      ? "Yes"
                      : "No"}
                  </Badge>
                  <Text>{game.createdTime}</Text>

                  <Link
                    isExternal
                    href={`https://goerli.etherscan.io/address/${game.addr}`}
                    display="flex"
                    alignItems="center"
                  >
                    {game.addr}
                    <FontAwesomeIcon
                      style={{ marginLeft: "6px" }}
                      icon={faExternalLink}
                    />
                  </Link>

                  <Link
                    isExternal
                    href={`https://goerli.etherscan.io/address/${game.oracleAddr}`}
                    display="flex"
                    alignItems="center"
                  >
                    {game.oracleAddr}
                    <FontAwesomeIcon
                      style={{ marginLeft: "6px" }}
                      icon={faExternalLink}
                    />
                  </Link>

                  <Box display="flex" alignItems="center">
                    <Text>{game.threshold}</Text>
                    <Tooltip
                      label="Higher than or equal to threshold results in an outcome of Yes."
                      fontSize="md"
                    >
                      <FontAwesomeIcon
                        style={{ marginLeft: "6px" }}
                        icon={faQuestion}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
              <Divider my="10" />
              <Box>
                <GameTransactionsHistory game={game} />
              </Box>
            </Box>
            <Box display="flex" flexDir="column">
              <Box w="full" textAlign="center">
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  columnGap="2.5"
                  mt="3"
                  mb="7"
                  flexWrap="wrap"
                >
                  <Text fontSize="xl" whiteSpace="nowrap">
                    Resolution Time:
                  </Text>
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    whiteSpace="nowrap"
                    textDecor="underline"
                  >
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZoneName: "short",
                    }).format(game.resolveTime * 1000)}
                  </Text>
                  {/* <Timestamp date={Date} /> */}
                </Box>
                <Box my="3" mx="auto" maxW="350px">
                  <Box>
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

              <Box>
                <Heading size="md" my="3">
                  Mintable token supply
                </Heading>
                <StatGroup>
                  <Stat>
                    <StatLabel>Exchange rate for 1 Game Token</StatLabel>
                    <StatNumber>1 HMTKN</StatNumber>
                    <StatHelpText>Fixed</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Game Yes Token supply left</StatLabel>
                    <StatNumber>{1000 - game.betYesAmount}</StatNumber>
                  </Stat>

                  <Stat>
                    <StatLabel>Game No Token supply left</StatLabel>
                    <StatNumber>{1000 - game.betNoAmount}</StatNumber>
                  </Stat>
                </StatGroup>

                <Divider my="10" />
                <Box>
                  <Heading mb="4" size="md">
                    Mint game tokens
                  </Heading>
                  <FormControl isRequired>
                    <FormLabel>Game token side</FormLabel>
                    <Select
                      placeholder="Select game token side"
                      onChange={(e) => {
                        setBuyTokenSide(e.target.value);
                        setMaxLimit(
                          1000 -
                            (e.target.value === "1"
                              ? game.betYesAmount
                              : game.betNoAmount)
                        );
                        setBuyTokenAmt(0);
                      }}
                      value={buyTokenSide}
                    >
                      <option value="1">Yes</option>
                      <option value="2">No</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Amount of game token</FormLabel>
                    <NumberInput
                      value={buyTokenAmt}
                      min={1}
                      max={maxLimit}
                      onChange={(v) => setBuyTokenAmt(v)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  {!(
                    buyTokenAmt <= 0 ||
                    buyTokenAmt > maxLimit ||
                    buyTokenAmt > main2TknAllowance
                  ) && (
                    <Box>
                      <Heading mt="5" mb="2" size="sm">
                        Transaction Summary
                      </Heading>
                      <Text>
                        ({shortenAddr(game.addr)}) {buyTokenAmt} game token{" "}
                        {"<->"} {buyTokenAmt * game2MainConversionRate} HMTKN (
                        {shortenAddr(wallet)})
                      </Text>
                    </Box>
                  )}

                  {buyTokenAmt > maxLimit && (
                    <Box
                      border="1px solid red"
                      textAlign="center"
                      p="1"
                      borderRadius="20px"
                      my="2"
                    >
                      <Text>
                        Cannot mint the requested token amount, try purchasing
                        from a player's listing.
                      </Text>
                    </Box>
                  )}
                  <Button
                    colorScheme="green"
                    variant="outline"
                    mt="6"
                    disabled={
                      buyTokenAmt <= 0 ||
                      buyTokenAmt > maxLimit ||
                      buyTokenAmt > main2TknAllowance
                    }
                    onClick={triggerPurchase}
                  >
                    Purchase
                  </Button>
                  {buyTokenAmt > main2TknAllowance && (
                    <Box display="flex" alignItems="center" mt="2">
                      <FontAwesomeIcon
                        icon={faX}
                        color="red"
                        style={{ marginRight: "5px" }}
                      />
                      <Text>
                        You cannot complete the purchase as your allowance is
                        too low.
                      </Text>
                      <Button
                        mx="3"
                        colorScheme="green"
                        variant="outline"
                        size="sm"
                        onClick={onOpen}
                      >
                        Increase allowance
                      </Button>
                    </Box>
                  )}

                  <AlertDialog
                    motionPreset="slideInBottom"
                    leastDestructiveRef={cancelRef}
                    onClose={onClose}
                    isOpen={isOpen}
                    isCentered
                  >
                    <AlertDialogOverlay />

                    <AlertDialogContent
                      minW={{ base: "100%", lg: "max-content" }}
                    >
                      {errorMsg ? (
                        <GameErrorDialog
                          errorMsg={errorMsg}
                          onClose={onClose}
                        />
                      ) : buyTokenAmt > main2TknAllowance ? (
                        <IncreaseAllowanceDialog
                          wallet={wallet}
                          gameAddr={game && game.addr}
                          onClose={onClose}
                          allowAmt={buyTokenAmt * game2MainConversionRate}
                          setMain2TknAllowance={setMain2TknAllowance}
                        />
                      ) : (
                        <PurchaseConfirmationDialog
                          trxHash={purchaseTrxHash}
                          onClose={onClose}
                        />
                      )}
                    </AlertDialogContent>
                  </AlertDialog>
                </Box>
              </Box>

              <Divider my="10" />

              <Box>
                <GameActiveListings game={game} />
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Text>Loading..</Text>
      )}
    </Box>
  );
}
