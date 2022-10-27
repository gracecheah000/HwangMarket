import { Box, Heading, Text, Button } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  hwangMarket,
  createAGame,
  getGameAddrById,
  getCurrentWalletConnected,
  connectWallet,
} from "../util/interact";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faHeart } from "@fortawesome/free-solid-svg-icons";
import { shortenAddr } from "../util/helper";

const CommonTop = ({ wallet, setWallet, colorMode, toggleColorMode }) => {
  const [status, setStatus] = useState("");

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

    addWalletListener();
  }, []);

  const navigate = useNavigate();

  return (
    <Box display="flex" p="5" alignItems="center" px="5%" flexWrap="wrap">
      <Box _hover={{ cursor: "pointer" }} onClick={() => navigate("/")} w="30%">
        <Heading color="blue.600">HWANGMARKET</Heading>
        <Text>The only place to lose your money, fast.</Text>
      </Box>
      <Box
        mx="auto"
        display="flex"
        justifyContent="center"
        alignItems="center"
        columnGap="24"
      >
        <Button
          variant="outline"
          colorScheme="facebook"
          borderRadius="13px"
          p="5"
        >
          Predictions
        </Button>
        <Button
          variant="outline"
          colorScheme="facebook"
          borderRadius="13px"
          p="5"
        >
          Portfolio
        </Button>
      </Box>
      <Box w="30%">
        <Box
          display="flex"
          justifyContent="space-evenly"
          alignItems="center"
          flexWrap="wrap"
          rowGap="5"
          columnGap="4"
        >
          <Button
            variant="outline"
            colorScheme="yellow"
            leftIcon={<FontAwesomeIcon icon={faHeart} />}
          >
            Get HMTKN
          </Button>
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
      </Box>
    </Box>
  );
};

export default CommonTop;
