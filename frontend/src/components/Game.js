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
  StatArrow,
  Spinner,
  Drawer,
  DrawerOverlay,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getGameById,
  hwangMarket,
  mintGameTokenFromMainToken,
  getMainToken2SenderApprovalAmt,
  getBalance,
  getGameTokenAddrByGameAddr,
  getGameTrxsByAddr,
  getMainTokenAddr,
  getMainTokenBalance,
  listTokensUp,
  gameContractABI,
  web3,
  getTokenAllowance,
  hwangMarketAddr,
  erc20TokenABI,
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
import { game2MainConversionRate, shortenAddr, sleep } from "../util/helper";
import CreateListingDrawer from "./GameDrawers/CreateListingDrawer";
import ListingDetailDrawer from "./GameDrawers/ListingDetailDrawer";
import ClaimWinningIncAllowanceDialog from "./GameDialogs/ClaimWinningIncAllowanceDialog";
import ClaimWinningDialog from "./GameDialogs/ClaimWinningDialog";
import { BigNumber } from "ethers";

export default function Game({ wallet }) {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const { colorMode } = useColorMode();

  const [percentage, setPercentage] = useState(0);
  const [diffText, setDiffText] = useState("");
  const [buyTokenSide, setBuyTokenSide] = useState("0");
  const [buyTokenAmt, setBuyTokenAmt] = useState("");
  const [maxLimit, setMaxLimit] = useState(1000);
  const [purchaseTrxHash, setPurchaseTrxHash] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [main2TknAllowance, setMain2TknAllowance] = useState(0);
  const [hmtknBalance, setHmtknBalance] = useState(0);
  const [gytBalance, setGytBalance] = useState(0);
  const [gntBalance, setGntBalance] = useState(0);

  const [hmtknAddr, setHmtknAddr] = useState("");
  const [gytAddr, setGytAddr] = useState("");
  const [gntAddr, setGntAddr] = useState("");

  const [isDialog, setIsDialog] = useState(true);
  const [isCreate, setIsCreate] = useState(true);
  const [winningTokenAllowance, setWinningTokenAllowance] = useState(0);
  const [winningTokenBalance, setWinningTokenBalance] = useState(0);

  const [listingSelected, setListingSelected] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const toast = useToast();

  useEffect(() => {
    const getGame = async () => {
      const game = await getGameById(id);
      setGame(game);
      const outcome = game.gameOutcome;
      setGameOutcome(outcome);

      if (outcome !== "0") {
        setWinningTokenBalance(
          await getBalance(wallet, game.addr, parseInt(outcome))
        );
        setWinningTokenAllowance(
          await getTokenAllowance(
            wallet,
            game.addr,
            outcome === "1" ? gytAddr : gntAddr
          )
        );
      }
    };
    getGame();
  }, [gntAddr, gytAddr, id, wallet]);

  const triggerPurchase = async () => {
    const { trxHash, err } = await mintGameTokenFromMainToken(
      wallet,
      game ? game.addr : "",
      buyTokenSide,
      buyTokenAmt,
      maxLimit
    );
    if (trxHash) {
      setErrorMsg("");
      setPurchaseTrxHash(trxHash);
    } else {
      setErrorMsg(err);
    }
    setBuyTokenSide("0");
    setBuyTokenAmt(0);
    setIsDialog(true);
    onOpen();
  };

  const addPlayerJoinedGameListener = () => {
    console.log("hwang market player joined game listener added");
    hwangMarket.events.PlayerJoinedGameEvent({}, async (error, data) => {
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

  const addNewListingListener = async () => {
    if (!game) {
      return;
    }
    console.log("new listing listener added");
    const gameContract = await new web3.eth.Contract(
      gameContractABI,
      game.addr
    );
    gameContract.events.NewListing({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        // const details = data.returnValues;
        toast({
          title: "Listing created!",
          description: "A new listing has been created!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    });
  };

  const addListingFulfilledListener = async () => {
    if (!game) {
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
        // const details = data.returnValues;
        toast({
          title: "Listing Fulfilled!",
          description: "A listing has been fulfilled!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    });
  };

  const addHMTKNApprovalListener = async () => {
    if (!hmtknAddr) {
      return;
    }
    console.log("HMTKN approval listener added");
    const tokenContract = await new web3.eth.Contract(erc20TokenABI, hmtknAddr);
    tokenContract.events.Approval({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues;
        if (details.owner.toLowerCase() === wallet.toLowerCase()) {
          toast({
            title: "Approval success!",
            description: `You have approved ${shortenAddr(
              details.spender
            )} as a spender for ${details.value} HMTKN!`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          if (
            game &&
            details.spender.toLowerCase() === game.addr.toLowerCase()
          ) {
            setMain2TknAllowance(details.value);
          }
        }
      }
    });
  };

  useEffect(() => {
    addHMTKNApprovalListener();
  }, [hmtknAddr]);

  const addGYTListener = async () => {
    if (!gytAddr) {
      return;
    }
    console.log("gyt listener added");
    const tokenContract = await new web3.eth.Contract(erc20TokenABI, gytAddr);
    tokenContract.events.Approval({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues;
        if (details.owner.toLowerCase() === wallet.toLowerCase()) {
          toast({
            title: "Approval success!",
            description: `You have approved ${shortenAddr(
              details.spender
            )} as a spender for ${details.value} GYT!`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          if (game.gameOutcome === "1") {
            setWinningTokenAllowance(details.value);
          }
        }
      }
    });
    tokenContract.events.Transfer({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues;
        if (details.from.toLowerCase() === wallet.toLowerCase()) {
          toast({
            title: "GYT Transfer success!",
            description: `You have transferred ${
              details.value
            } GYT to ${shortenAddr(details.to)}!`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setGytBalance((prev) =>
            BigNumber.from(prev).sub(BigNumber.from(details.value)).toString()
          );
        } else if (details.to.toLowerCase() === wallet.toLowerCase()) {
          toast({
            title: "GYT Transfer success!",
            description: `You have received ${
              details.value
            } GYT from ${shortenAddr(details.to)}!`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setGytBalance((prev) =>
            BigNumber.from(prev).add(BigNumber.from(details.value)).toString()
          );
        }
      }
    });
  };

  useEffect(() => {
    addGYTListener();
  }, [gytAddr]);

  const addGNTApprovalListener = async () => {
    if (!gntAddr) {
      return;
    }
    console.log("gnt approval listener added");
    const tokenContract = await new web3.eth.Contract(erc20TokenABI, gntAddr);
    tokenContract.events.Approval({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues;
        if (details.owner.toLowerCase() === wallet.toLowerCase()) {
          toast({
            title: "Approval success!",
            description: `You have approved ${shortenAddr(
              details.spender
            )} as a spender for ${details.value} GNT!`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          if (game.gameOutcome === "2") {
            setWinningTokenAllowance(details.value);
          }
        }
      }
    });

    tokenContract.events.Transfer({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues;
        if (details.from.toLowerCase() === wallet.toLowerCase()) {
          toast({
            title: "GNT Transfer success!",
            description: `You have transferred ${
              details.value
            } GNT to ${shortenAddr(details.to)}!`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setGntBalance((prev) =>
            BigNumber.from(prev).sub(BigNumber.from(details.value)).toString()
          );
        } else if (details.to.toLowerCase() === wallet.toLowerCase()) {
          toast({
            title: "GNT Transfer success!",
            description: `You have received ${
              details.value
            } GNT from ${shortenAddr(details.to)}!`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setGntBalance((prev) =>
            BigNumber.from(prev).add(BigNumber.from(details.value)).toString()
          );
        }
      }
    });
  };

  useEffect(() => {
    addGNTApprovalListener();
  }, [gntAddr]);

  useEffect(() => {
    const updateAllowance = async () => {
      setMain2TknAllowance(
        await getMainToken2SenderApprovalAmt(wallet, game && game.addr)
      );
    };
    const setBalance = async () => {
      setHmtknBalance(await getMainTokenBalance(wallet));
      setGytBalance(await getBalance(wallet, game && game.addr, 1));
      setGntBalance(await getBalance(wallet, game && game.addr, 2));
    };
    const setGameTokenAddr = async () => {
      setGytAddr(await getGameTokenAddrByGameAddr(game && game.addr, 1));
      setGntAddr(await getGameTokenAddrByGameAddr(game && game.addr, 2));
    };
    const setMainTokenAddr = async () => {
      setHmtknAddr(await getMainTokenAddr());
    };

    updateAllowance();
    setBalance();
    setGameTokenAddr();
    setMainTokenAddr();
  }, [wallet, game]);

  useEffect(() => {
    addNewListingListener();
    addListingFulfilledListener();
  }, [game]);

  const addGameConcludedListener = async () => {
    if (!game) {
      return;
    }
    console.log("game concluded listener added");
    hwangMarket.events.GameConcluded({}, async (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        if (data.returnValues.gameId !== id) {
          return;
        }
        const outcome = data.returnValues.gameOutcome;
        toast({
          title: "Game concluded!",
          description: `The game has concluded with an outcome of "${
            outcome === "1" ? "YES" : "NO"
          }"!`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        setGame((prev) => {
          const copy = JSON.parse(JSON.stringify(prev));
          copy.gameOutcome = outcome;
          return copy;
        });
        setGameOutcome(data.returnValues.gameOutcome);
        setWinningTokenBalance(
          await getBalance(wallet, game.addr, parseInt(outcome))
        );
        setWinningTokenAllowance(
          await getTokenAllowance(
            wallet,
            game.addr,
            outcome === "1" ? gytAddr : gntAddr
          )
        );
      }
    });
  };

  useEffect(() => {
    addPlayerJoinedGameListener();
    addGameConcludedListener();
  }, [game]);

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
  }, [game]);

  const [gameOutcome, setGameOutcome] = useState("0");

  useEffect(() => {
    // fetch game outcome
    if (percentage !== 100) {
      return;
    }
    const updateGameOutcome = async () => {
      // update game outcome
      const game = await getGameById(id);
      const outcome = game.gameOutcome;
      setGameOutcome(outcome);
      setWinningTokenBalance(
        await getBalance(wallet, game.addr, parseInt(outcome))
      );
      setWinningTokenAllowance(
        await getTokenAllowance(
          wallet,
          game.addr,
          outcome === "1" ? gytAddr : gntAddr
        )
      );
    };

    updateGameOutcome();
  }, [gntAddr, gytAddr, id, percentage, wallet]);

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
              <Badge mt="2" colorScheme="green" variant="outline">
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
                        value: Math.max(0.01, parseInt(game.betNoAmount)),
                        color: "#FF1E1E",
                      },
                      {
                        title: "Yes",
                        value: Math.max(0.01, parseInt(game.betYesAmount)),
                        color: "#3CCF4E",
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
                      fill: colorMode === "light" ? "#1A202C" : "#EDF2F7",
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
                // bgColor={colorMode === "light" ? "cyan.100" : ""}
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
                    color={colorMode === "light" ? "teal.700" : "teal.300"}
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
                    color={colorMode === "light" ? "teal.700" : "teal.300"}
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
                <GameTransactionsHistory gameAddr={game && game.addr} />
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
                      strokeWidth={4}
                      styles={buildStyles({
                        textSize: "14px",
                        textColor: colorMode === "light" ? "black" : "white",
                        trailColor:
                          colorMode === "light" ? "#4A5568" : "#718096",
                        pathColor:
                          colorMode === "light" ? "#0BC5EA" : "#76E4F7",
                      })}
                    />
                  </Box>
                </Box>
              </Box>

              <Box>
                {gameOutcome === "0" && (
                  <>
                    <Heading size="md" mt="5" mb="3">
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
                  </>
                )}
                <Divider my="7" />
                <Heading size="md" mb="3">
                  Owned tokens
                </Heading>
                <StatGroup w="100%">
                  <Stat>
                    <StatLabel>Game Yes Token</StatLabel>
                    <StatNumber>{gytBalance}</StatNumber>
                    <StatHelpText>GYT (GameYesToken)</StatHelpText>
                    <StatHelpText>
                      <Text fontSize="xs">{gytAddr}</Text>
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Game No Token</StatLabel>
                    <StatNumber>{gntBalance}</StatNumber>
                    <StatHelpText>GNT (GameNoToken)</StatHelpText>
                    <StatHelpText>
                      <Text fontSize="xs">{gntAddr}</Text>
                    </StatHelpText>
                  </Stat>
                </StatGroup>
                <Divider my="7" />
                {gameOutcome !== "0" ? (
                  <Box>
                    <Heading mb="4" size="md">
                      Trade in game token
                    </Heading>
                    <StatGroup>
                      <Stat>
                        <StatLabel>Winning token</StatLabel>
                        <StatNumber>
                          {" "}
                          {gameOutcome === "1"
                            ? "Game Yes Token"
                            : "Game No Token"}
                        </StatNumber>
                        <StatHelpText>
                          <Text fontSize="xs">
                            {gameOutcome === "1" ? gytAddr : gntAddr}
                          </Text>
                        </StatHelpText>
                      </Stat>
                    </StatGroup>

                    <Box mt="3">
                      {(gameOutcome === "1" &&
                        BigNumber.from(gytBalance).gt(BigNumber.from(0))) ||
                      (gameOutcome === "2" &&
                        BigNumber.from(gntBalance).gt(BigNumber.from(0))) ? (
                        <Button
                          colorScheme="whatsapp"
                          variant="outline"
                          onClick={() => {
                            setIsDialog(true);
                            onOpen();
                          }}
                        >
                          Collect Winnings{" "}
                          {winningTokenAllowance < winningTokenBalance &&
                            "(Approval required first)"}
                        </Button>
                      ) : (
                        <Text fontWeight="bold">
                          You have no winning tokens to claim.
                        </Text>
                      )}
                    </Box>
                  </Box>
                ) : (
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
                    <FormControl isRequired mt="3">
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
                      (buyTokenSide !== "1" && buyTokenSide !== "2") ||
                      buyTokenAmt <= 0 ||
                      buyTokenAmt > maxLimit ||
                      buyTokenAmt > main2TknAllowance
                    ) && (
                      <Box>
                        <Heading mt="8" mb="4" size="sm">
                          Transaction Summary
                        </Heading>
                        <StatGroup w="100%">
                          <Stat>
                            <StatLabel>
                              {buyTokenSide === "1" ? "GYT" : "GNT"}
                            </StatLabel>
                            <StatNumber>{buyTokenAmt}</StatNumber>
                            <StatHelpText>
                              <StatArrow type="increase" />
                              Gain {buyTokenAmt}{" "}
                              {buyTokenSide === "1" ? "GYT" : "GNT"}
                            </StatHelpText>
                            <StatHelpText>
                              <Text fontSize="xs">
                                {buyTokenSide === "1" ? gytAddr : gntAddr}
                              </Text>
                            </StatHelpText>
                          </Stat>
                          <Stat>
                            <StatLabel>HMTKN</StatLabel>
                            <StatNumber>
                              {buyTokenAmt * game2MainConversionRate}
                            </StatNumber>
                            <StatHelpText>
                              <StatArrow type="decrease" />
                              Lose {buyTokenAmt} HMTKN
                            </StatHelpText>
                            <StatHelpText>
                              <Text fontSize="xs">{hmtknAddr}</Text>
                            </StatHelpText>
                          </Stat>
                        </StatGroup>
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
                        (buyTokenSide !== "1" && buyTokenSide !== "2") ||
                        buyTokenAmt <= 0 ||
                        buyTokenAmt > maxLimit ||
                        buyTokenAmt > main2TknAllowance
                      }
                      onClick={triggerPurchase}
                    >
                      Mint Game Tokens
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
                          onClick={() => {
                            setIsDialog(true);
                            onOpen();
                          }}
                        >
                          Increase allowance
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
                <AlertDialog
                  motionPreset="slideInBottom"
                  leastDestructiveRef={cancelRef}
                  onClose={onClose}
                  isOpen={isDialog && isOpen}
                  isCentered
                >
                  <AlertDialogOverlay />

                  <AlertDialogContent
                    minW={{ base: "100%", lg: "max-content" }}
                  >
                    {gameOutcome === "0" && errorMsg ? (
                      <GameErrorDialog errorMsg={errorMsg} onClose={onClose} />
                    ) : gameOutcome === "0" &&
                      buyTokenAmt > main2TknAllowance ? (
                      <IncreaseAllowanceDialog
                        wallet={wallet}
                        gameAddr={game && game.addr}
                        onClose={onClose}
                        allowAmt={buyTokenAmt * game2MainConversionRate}
                      />
                    ) : gameOutcome === "0" ? (
                      <PurchaseConfirmationDialog
                        trxHash={purchaseTrxHash}
                        onClose={onClose}
                      />
                    ) : winningTokenAllowance < winningTokenBalance ? (
                      <ClaimWinningIncAllowanceDialog
                        wallet={wallet}
                        gameAddr={game && game.addr}
                        onClose={onClose}
                        outcome={game && game.gameOutcome}
                        approvalAmt={winningTokenBalance}
                        winningTokenAddr={
                          gameOutcome === "1" ? gytAddr : gntAddr
                        }
                      />
                    ) : winningTokenAllowance === winningTokenBalance ? (
                      <ClaimWinningDialog
                        wallet={wallet}
                        gameAddr={game && game.addr}
                        outcome={game && game.gameOutcome}
                        onClose={onClose}
                        withdrawAmt={winningTokenBalance}
                        hmtknAddr={hmtknAddr}
                        winningTokenAddr={
                          gameOutcome === "1" ? gytAddr : gntAddr
                        }
                        totalLoseAmt={
                          gameOutcome === "1"
                            ? game && game.betNoAmount
                            : game && game.betYesAmount
                        }
                        totalWinAmt={
                          gameOutcome === "1"
                            ? game && game.betYesAmount
                            : game && game.betNoAmount
                        }
                      />
                    ) : (
                      <GameErrorDialog
                        errorMsg="We got lost in the sauce. :("
                        onClose={onClose}
                      />
                    )}
                  </AlertDialogContent>
                </AlertDialog>
              </Box>

              <Divider my="10" />

              <Box>
                <GameActiveListings
                  game={game}
                  setIsDialog={setIsDialog}
                  onOpen={onOpen}
                  gytAddr={gytAddr}
                  gntAddr={gntAddr}
                  hmtknAddr={hmtknAddr}
                  setIsCreate={setIsCreate}
                  setListingSelected={setListingSelected}
                />

                <Drawer
                  size="lg"
                  isOpen={!isDialog && isOpen}
                  placement="right"
                  onClose={onClose}
                  finalFocusRef={cancelRef}
                >
                  <DrawerOverlay />
                  {isCreate ? (
                    <CreateListingDrawer
                      wallet={wallet}
                      gytAddr={gytAddr}
                      gytBalance={gytBalance}
                      gntAddr={gntAddr}
                      gntBalance={gntBalance}
                      hmtknAddr={hmtknAddr}
                      toast={toast}
                      onClose={onClose}
                    />
                  ) : (
                    <ListingDetailDrawer
                      wallet={wallet}
                      listingSelected={listingSelected}
                      onClose={onClose}
                      toast={toast}
                    />
                  )}
                </Drawer>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Spinner color="red.500" />
      )}
    </Box>
  );
}
