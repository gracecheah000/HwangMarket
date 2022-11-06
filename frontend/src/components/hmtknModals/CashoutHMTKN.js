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
import {
  faHeart,
  faMoneyBillTransfer,
} from "@fortawesome/free-solid-svg-icons";
import {
  cashoutMainToken,
  getMainTokenAddr,
  getMainTokenBalance,
  getNetworkID,
  getNetworkTokenInfo,
  mainTokenABI,
  mintMainToken,
  web3,
} from "../../util/interact";
import { eth2MainConversionRate, shortenAddr } from "../../util/helper";
import { BigNumber } from "ethers";

export default function CashoutHMTKN({ wallet, isOpen, onClose }) {
  const [mainTknBalance, setMainTknBalance] = useState(0);
  const [networkId, setNetworkId] = useState("");
  const [cashoutAmt, setCashoutAmt] = useState("");
  const [mainTokenAddr, setMainTokenAddr] = useState("");
  const [networkInfo, setNetworkInfo] = useState(null);

  const toast = useToast();

  useEffect(() => {
    const update = async () => {
      setMainTknBalance(await getMainTokenBalance(wallet));
      setNetworkId(await getNetworkID());
      setMainTokenAddr(await getMainTokenAddr());
      setNetworkInfo(await getNetworkTokenInfo());
    };
    update();
  }, [wallet]);

  const cashoutHMTKN = async () => {
    const { trxHash, err } = await cashoutMainToken(wallet, cashoutAmt);
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
        title: "Transaction processing...",
        description: `Your transaction hash is: ${trxHash}. This message will be removed in 20 seconds and lost permanently, save the transaction hash if you wish.`,
        status: "info",
        duration: 20000,
        isClosable: true,
      });
    }
    setCashoutAmt("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent borderRadius="17px">
        <ModalHeader>
          <FontAwesomeIcon
            color="#48BB78"
            icon={faMoneyBillTransfer}
            style={{ marginRight: "10px" }}
          />
          Cash out HMTKN
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
              HMTKN balance: {mainTknBalance}
            </Heading>
          </Box>
          <Heading size="sm">HMTKN address: </Heading>{" "}
          <Text my="1" fontWeight="bold" fontSize="sm">
            {mainTokenAddr}
          </Text>
          <Divider my="5" />
          <FormControl>
            <FormLabel>Amount of HMTKN to cash out</FormLabel>
            <NumberInput
              value={cashoutAmt}
              min={1}
              max={getMainTokenBalance}
              onChange={(v) => setCashoutAmt(v)}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText>
              Withdraws HMTKN from your account and deposits the equivalent
              amount into your wallet in the form of the network's native token.
            </FormHelperText>
          </FormControl>
          {cashoutAmt !== "" && (
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
                    {cashoutAmt * (1 / eth2MainConversionRate)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Gain {cashoutAmt * (1 / eth2MainConversionRate)}{" "}
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
                  <StatNumber>{cashoutAmt}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    Lose {cashoutAmt} HMTKN
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
              cashoutAmt !== "" &&
              BigNumber.from(cashoutAmt).gt(BigNumber.from(mainTknBalance))
            }
            onClick={cashoutHMTKN}
          >
            Cash out
          </Button>
        </ModalFooter>

        <Box display="flex" alignItems="center" justifyContent="center">
          <FontAwesomeIcon
            color="#48BB78"
            icon={faMoneyBillTransfer}
            style={{ marginRight: "10px" }}
          />
          <Text as="cite" my="5">
            Cash me outside howbow dah
          </Text>
        </Box>
      </ModalContent>
    </Modal>
  );
}
