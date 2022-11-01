import {
  Box,
  Heading,
  Text,
  Button,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  hwangMarket,
  createAGame,
  getGameAddrById,
  getCurrentWalletConnected,
  connectWallet,
  web3,
  mainTokenABI,
  getMainTokenAddr,
  getMainTokenBalance,
} from "../util/interact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faHeart,
  faEthernet,
  faCashRegister,
  faMoneyBill,
  faMoneyBillTransfer,
} from "@fortawesome/free-solid-svg-icons";
import { shortenAddr } from "../util/helper";
import { BigNumber } from "ethers";
import GetHMTKN from "./hmtknModals/GetHMTKN";
import CashoutHMTKN from "./hmtknModals/CashoutHMTKN";

const CommonTop = ({ wallet, setWallet, colorMode, toggleColorMode }) => {
  const [status, setStatus] = useState("");
  const [hmtknAddr, setHmtknAddr] = useState("");
  const [hmtknBalance, setHmtknBalance] = useState("-");
  const [isGetHMTKN, setIsGetHMTKN] = useState(true);

  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const addHMTKNTransferListener = async () => {
    console.log("HMTKN transfer listener added");
    const mainTokenContract = new web3.eth.Contract(
      mainTokenABI,
      await getMainTokenAddr()
    );
    mainTokenContract.events.Transfer({}, (error, data) => {
      if (error) {
        console.log("listener error:", error);
      } else {
        const details = data.returnValues;
        /*
        from: "0x3E0944145a5B83D03C09b93CD4CCdFaE6dd817AB"
        to: "0xb50b7E6629901979580a440B8C066122506Ed7ae"
        value: "4"
        */
        if (String(details.to).toLowerCase() === String(wallet).toLowerCase()) {
          toast({
            title: "HMTKN received!",
            description: `You have received ${
              details.value
            } HMTKN from ${shortenAddr(details.from)}`,
            status: "success",
            duration: 8000,
            isClosable: true,
          });

          setHmtknBalance((prev) =>
            BigNumber.from(prev).add(BigNumber.from(details.value)).toString()
          );
        } else if (
          String(details.from).toLowerCase() === String(wallet).toLowerCase()
        ) {
          toast({
            title: "HMTKN sent!",
            description: `You have sent ${details.value} HMTKN to ${shortenAddr(
              details.to
            )}`,
            status: "success",
            duration: 8000,
            isClosable: true,
          });
          setHmtknBalance((prev) =>
            BigNumber.from(prev).sub(BigNumber.from(details.value)).toString()
          );
        }
      }
    });
  };

  const connectWalletPressed = async () => {
    if (wallet) {
      return;
    }
    const walletResponse = await connectWallet();

    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  useEffect(() => {
    async function fetchWallet() {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    }
    fetchWallet();

    async function updateHmtknMetadata() {
      setHmtknBalance(await getMainTokenBalance(wallet));
      setHmtknAddr(await getMainTokenAddr());
    }
    updateHmtknMetadata();

    addWalletListener();
    addHMTKNTransferListener();
  }, [wallet]);

  const navigate = useNavigate();

  return (
    <Box display="flex" p="5" alignItems="center" px="5%" flexWrap="wrap">
      <Box _hover={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        <Heading color="blue.600">HWANGMARKET</Heading>
        <Text>The only place to lose your money, fast.</Text>
      </Box>
      <Box
        mr="auto"
        ml="24"
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        columnGap="24"
      >
        <Button
          variant="outline"
          colorScheme="facebook"
          borderRadius="13px"
          p="5"
          onClick={() => navigate("/")}
        >
          Markets
        </Button>
        <Button
          variant="outline"
          colorScheme="facebook"
          borderRadius="13px"
          p="5"
          onClick={() => navigate("/history")}
        >
          History
        </Button>
      </Box>
      <Box>
        <Box
          display="flex"
          flexDir="column"
          alignItems="flex-end"
          columnGap="5"
          rowGap="4"
        >
          <Box
            display="flex"
            justifyContent="space-evenly"
            alignItems="center"
            flexWrap="wrap"
            rowGap="5"
            columnGap="10"
          >
            <Button
              onClick={toggleColorMode}
              variant="outline"
              colorScheme={colorMode === "dark" ? "orange" : "black"}
            >
              {colorMode === "light" ? (
                <FontAwesomeIcon icon={faMoon} />
              ) : (
                <FontAwesomeIcon icon={faSun} />
              )}
            </Button>
            <Box
              display="flex"
              flexDir="column"
              justifyContent="center"
              alignItems="center"
              rowGap="2"
            >
              <Button
                mt="2"
                onClick={connectWalletPressed}
                variant="outline"
                colorScheme="linkedin"
              >
                {wallet.length > 0 ? (
                  "Connected: " + shortenAddr(wallet)
                ) : (
                  <span>Connect Wallet</span>
                )}
              </Button>
              <Text>{status}</Text>
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            flexWrap="wrap"
            rowGap="5"
            columnGap="10"
          >
            <Stat>
              <StatLabel>HMTKN Balance</StatLabel>
              <StatNumber>{hmtknBalance} HMTKN</StatNumber>
              <StatHelpText>{shortenAddr(hmtknAddr)}</StatHelpText>
            </Stat>
            <Button
              variant="outline"
              colorScheme="yellow"
              leftIcon={<FontAwesomeIcon icon={faHeart} />}
              onClick={() => {
                onOpen();
                setIsGetHMTKN(true);
              }}
            >
              Get HMTKN
            </Button>
            <Button
              variant="outline"
              colorScheme="whatsapp"
              leftIcon={<FontAwesomeIcon icon={faMoneyBillTransfer} />}
              onClick={() => {
                onOpen();
                setIsGetHMTKN(false);
              }}
            >
              Cash out HMTKN
            </Button>
          </Box>
        </Box>
      </Box>

      {isGetHMTKN ? (
        <GetHMTKN wallet={wallet} isOpen={isOpen} onClose={onClose} />
      ) : (
        <CashoutHMTKN wallet={wallet} isOpen={isOpen} onClose={onClose} />
      )}
    </Box>
  );
};

export default CommonTop;
