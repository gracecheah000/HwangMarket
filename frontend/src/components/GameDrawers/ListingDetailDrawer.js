import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  Button,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerCloseButton,
  Text,
  useColorMode,
  Link,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Divider,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { acceptTokenExchange, getERC20Tokenbalance } from "../../util/interact";

export default function ListingDetailDrawer({
  wallet,
  onClose,
  listingSelected,
  toast,
}) {
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

  const { colorMode } = useColorMode();
  const [token2Balance, setToken2Balance] = useState(-1);

  useEffect(() => {
    const updateTokenBalance = async () => {
      setToken2Balance(
        await getERC20Tokenbalance(wallet, listingSelected.token2)
      );
    };

    updateTokenBalance();
  }, []);

  const triggerAcceptListing = async () => {
    const { trxHash, err } = await acceptTokenExchange(wallet, listingSelected);
    if (err) {
      toast({
        title: "Transaction failed!",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Accepting listing...",
        description: `Your transaction hash is: ${trxHash}. This message will be removed in 20 seconds and lost permanently, save the transaction hash if you wish.`,
        status: "info",
        duration: 20000,
        isClosable: true,
      });
    }

    onClose();
  };

  return (
    <>
      {listingSelected ? (
        <DrawerContent>
          <DrawerCloseButton />
          {token2Balance === -1 ? (
            <Box textAlign="center" my="auto">
              <Spinner size="xl" color="red.500" mx="auto" />
              <Text my="4" fontSize="sm">
                Hang on, we are fetching some stuff...
              </Text>
            </Box>
          ) : (
            <>
              <DrawerHeader mt="2" fontSize="2xl" mb="4">
                Listing Information ✨
              </DrawerHeader>

              <DrawerBody display="flex" flexDir="column" rowGap="3.5">
                <Box display="flex" alignItems="center" columnGap="2">
                  <Heading size="sm">Listing contract address: </Heading>
                  <Link
                    isExternal
                    href={`https://goerli.etherscan.io/address/${listingSelected.listingAddr}`}
                    display="flex"
                    alignItems="center"
                    color={colorMode === "light" ? "teal.700" : "teal.300"}
                  >
                    {listingSelected.listingAddr}

                    <FontAwesomeIcon
                      style={{ marginLeft: "6px" }}
                      icon={faExternalLink}
                    />
                  </Link>
                </Box>
                <Box display="flex" alignItems="center" columnGap="2">
                  <Heading size="sm">Creator address: </Heading>
                  <Link
                    isExternal
                    href={`https://goerli.etherscan.io/address/${listingSelected.player1}`}
                    display="flex"
                    alignItems="center"
                    color={colorMode === "light" ? "teal.700" : "teal.300"}
                  >
                    {listingSelected.player1}

                    <FontAwesomeIcon
                      style={{ marginLeft: "6px" }}
                      icon={faExternalLink}
                    />
                  </Link>
                </Box>

                <Box display="flex" alignItems="center" columnGap="2">
                  <Heading size="sm">Listing status: </Heading>
                  <Badge
                    colorScheme={listingSelected.fulfilled ? "red" : "whatsapp"}
                    variant="outline"
                  >
                    {listingSelected.fulfilled ? "Closed" : "Open"}
                  </Badge>
                </Box>
                <Divider my="4" />
                <Heading size="md">Listing Summary for you</Heading>
                <Box>
                  <StatGroup mt="3" mb="4">
                    <Stat>
                      <StatLabel>Offering</StatLabel>
                      <StatNumber>{listingSelected.token1Amt}</StatNumber>
                      <StatHelpText
                        display="flex"
                        alignItems="center"
                        columnGap="1"
                      >
                        <StatArrow type="increase" />
                        Offered token:
                        <Link
                          isExternal
                          href={`https://goerli.etherscan.io/address/${listingSelected.token1}`}
                          display="flex"
                          alignItems="center"
                          color={
                            colorMode === "light" ? "teal.700" : "teal.300"
                          }
                          fontSize="sm"
                        >
                          {listingSelected.token1}

                          <FontAwesomeIcon
                            style={{ marginLeft: "6px" }}
                            icon={faExternalLink}
                          />
                        </Link>
                      </StatHelpText>
                    </Stat>
                  </StatGroup>

                  <StatGroup>
                    <Stat>
                      <StatLabel>In exchange for</StatLabel>
                      <StatNumber>{listingSelected.token2Amt}</StatNumber>
                      <StatHelpText
                        display="flex"
                        alignItems="center"
                        columnGap="1"
                      >
                        <StatArrow type="decrease" />
                        Asked token:
                        <Link
                          isExternal
                          href={`https://goerli.etherscan.io/address/${listingSelected.token2}`}
                          display="flex"
                          alignItems="center"
                          color={
                            colorMode === "light" ? "teal.700" : "teal.300"
                          }
                          fontSize="sm"
                        >
                          {listingSelected.token2}

                          <FontAwesomeIcon
                            style={{ marginLeft: "6px" }}
                            icon={faExternalLink}
                          />
                        </Link>
                      </StatHelpText>
                    </Stat>
                  </StatGroup>

                  <Box display="flex" alignItems="center" columnGap="2">
                    <Heading size="xs">Your available balance: </Heading>
                    <Text fontWeight="bold">{token2Balance}</Text>
                  </Box>

                  {token2Balance < parseInt(listingSelected.token2Amt) ? (
                    <Box
                      p="3"
                      border="1px solid red"
                      borderRadius="17px"
                      w="fit-content"
                      mx="auto"
                      mt="7"
                    >
                      <Text>
                        ❌ You have insufficient balance to partake in this
                        listing.{" "}
                      </Text>
                    </Box>
                  ) : (
                    <Box
                      p="3"
                      border="1px solid green"
                      borderRadius="17px"
                      w="fit-content"
                      mx="auto"
                      my="4"
                    >
                      <Text>
                        ✅ You have sufficient balance to partake in this
                        listing.{" "}
                      </Text>
                    </Box>
                  )}
                </Box>

                <Box ml="auto" my="6" mx="auto">
                  <Button
                    variant="outline"
                    mr="16"
                    onClick={onClose}
                    colorScheme="telegram"
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="whatsapp"
                    variant="outline"
                    disabled={
                      token2Balance < parseInt(listingSelected.token2Amt)
                    }
                    onClick={triggerAcceptListing}
                  >
                    Accept
                  </Button>
                </Box>
              </DrawerBody>
            </>
          )}

          <DrawerFooter>
            <Heading
              as="cite"
              fontSize="md"
              fontWeight="bold"
              mx="auto"
              my="15"
            >
              <span style={{ marginRight: "15px" }}>♦️</span>
              <Link
                textDecor="underline"
                href="https://youtu.be/yE4fYr47iRI"
                isExternal
              >
                You are something special
              </Link>
              <span style={{ marginLeft: "15px" }}>♦️</span>
            </Heading>
          </DrawerFooter>
        </DrawerContent>
      ) : (
        <Text>Invalid listing</Text>
      )}
    </>
  );
}
