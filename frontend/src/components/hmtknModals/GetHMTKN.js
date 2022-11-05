import React, { useEffect, useState } from "react";
import {
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Heading,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  Box,
  Text,
  Divider,
  useToast,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import {
  getMainTokenAddr,
  getNetworkID,
  getNetworkTokenBalance,
  getNetworkTokenInfo,
  mintMainToken,
} from "../../util/interact";
import { eth2MainConversionRate, shortenAddr } from "../../util/helper";
import { BigNumber } from "ethers";

export default function GetHMTKN({ wallet, isOpen, onClose }) {
  const [networkTknBalance, setNetworkTknBalance] = useState(0);
  const [networkId, setNetworkId] = useState("");
  const [mintAmt, setMintAmt] = useState("");
  const [mainTokenAddr, setMainTokenAddr] = useState("");
  const [networkInfo, setNetworkInfo] = useState(null);

  const toast = useToast();

  useEffect(() => {
    const update = async () => {
      setNetworkTknBalance(await getNetworkTokenBalance(wallet));
      setNetworkId(await getNetworkID());
      setMainTokenAddr(await getMainTokenAddr());
      setNetworkInfo(await getNetworkTokenInfo());
    };
    update();
  }, [wallet]);

  const mintHMTKN = async () => {
    const { trxHash, err } = await mintMainToken(wallet, mintAmt);
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
        title: "Creating listing...",
        description: `Your transaction hash is: ${trxHash}. This message will be removed in 20 seconds and lost permanently, save the transaction hash if you wish.`,
        status: "info",
        duration: 20000,
        isClosable: true,
      });
    }
    setMintAmt("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent borderRadius="17px">
        <ModalHeader>
          <FontAwesomeIcon
            color="#ECC94B"
            icon={faHeart}
            style={{ marginRight: "10px" }}
          />
          Get HMTKN
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Box my="2">
              <Heading size="sm">Network ID: {networkId}</Heading>
              <Text fontSize="sm">
                This is a guesstimate of the network you are on.
              </Text>
            </Box>
            <Heading size="sm" my="5">
              Network Token balance: {networkTknBalance}
            </Heading>
          </Box>
          <Heading size="sm">HMTKN address: </Heading>{" "}
          <Text my="1" fontWeight="bold" fontSize="sm">
            {mainTokenAddr}
          </Text>
          <Divider my="5" />
          <FormControl>
            <FormLabel>Amount of HMTKN to mint</FormLabel>
            <NumberInput
              value={mintAmt}
              min={1}
              max={networkTknBalance}
              onChange={(v) => setMintAmt(v)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              Mints HMTKN from an uncapped supply, in exchange for the network's
              main token. Your maximum mintable amount: {networkTknBalance}
            </FormHelperText>
          </FormControl>
          {mintAmt !== "" && (
            <>
              <Box mt="8" mb="4">
                <Heading size="sm">Transaction Summary</Heading>
                <Text fontSize="xs">
                  The network native currency is a "best effort guess" by us. It
                  may or may not be accurate. Do refer to the actual
                  confirmation by Metamask when prompted.
                </Text>
              </Box>
              <StatGroup w="100%">
                <Stat>
                  <StatLabel>Exchange rate for 1 HMTKN</StatLabel>
                  <StatNumber>
                    1{" "}
                    {networkInfo && networkInfo.nativeCurrency
                      ? networkInfo.nativeCurrency.symbol
                      : "Network native currency"}
                  </StatNumber>
                  <StatHelpText>Fixed</StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>
                    {networkInfo && networkInfo.nativeCurrency
                      ? networkInfo.nativeCurrency.symbol
                      : "Network native currency"}
                  </StatLabel>
                  <StatNumber>
                    {mintAmt * (1 / eth2MainConversionRate)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Lose {mintAmt * (1 / eth2MainConversionRate)}{" "}
                    {networkInfo && networkInfo.nativeCurrency
                      ? networkInfo.nativeCurrency.name
                      : "Network native currency"}
                  </StatHelpText>
                  <StatHelpText>
                    <Text fontSize="xs">
                      {networkInfo && networkInfo.nativeCurrency
                        ? networkInfo.nativeCurrency.name
                        : "Network native currency"}
                    </Text>
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>HMTKN</StatLabel>
                  <StatNumber>{mintAmt}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Gain {mintAmt} HMTKN
                  </StatHelpText>
                  <StatHelpText>
                    <Text fontSize="xs">{mainTokenAddr}</Text>
                  </StatHelpText>
                </Stat>
              </StatGroup>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose} variant="outline">
            Close
          </Button>
          <Button
            variant="outline"
            colorScheme="whatsapp"
            disabled={
              mintAmt !== "" &&
              BigNumber.from(mintAmt).gt(BigNumber.from(networkTknBalance))
            }
            onClick={mintHMTKN}
          >
            Mint
          </Button>
        </ModalFooter>

        <Box display="flex" alignItems="center" justifyContent="center">
          <FontAwesomeIcon
            color="#ECC94B"
            icon={faHeart}
            style={{ marginRight: "10px" }}
          />
          <Text as="cite" my="5">
            If it works, do not touch it!
          </Text>
        </Box>
      </ModalContent>
    </Modal>
  );
}
