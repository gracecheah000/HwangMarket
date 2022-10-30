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
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import {
  getMainTokenAddr,
  getNetworkID,
  getNetworkTokenBalance,
  mainTokenABI,
  mintMainToken,
  web3,
} from "../../util/interact";
import { shortenAddr } from "../../util/helper";

export default function GetHMTKN({ wallet, isOpen, onClose }) {
  const [networkTknBalance, setNetworkTknBalance] = useState(0);
  const [networkId, setNetworkId] = useState("");
  const [mintAmt, setMintAmt] = useState("");
  const [mainTokenAddr, setMainTokenAddr] = useState("");

  const toast = useToast();

  useEffect(() => {
    const update = async () => {
      setNetworkTknBalance(await getNetworkTokenBalance(wallet));
      setNetworkId(await getNetworkID());
      setMainTokenAddr(await getMainTokenAddr());
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
    <Modal isOpen={isOpen} onClose={onClose}>
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
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose} variant="outline">
            Close
          </Button>
          <Button
            variant="outline"
            colorScheme="whatsapp"
            disabled={mintAmt > networkTknBalance}
            onClick={mintHMTKN}
          >
            Mint
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
