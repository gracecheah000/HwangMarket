import React, { useState } from "react";
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
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  useToast,
  Code,
} from "@chakra-ui/react";
import { listTokensUp } from "../../util/interact";
import { Link as routerLink } from "react-router-dom";

export default function CreateListingDrawer({
  wallet,
  gytAddr,
  gytBalance,
  gntAddr,
  gntBalance,
  hmtknAddr,
  toast,
  onClose,
}) {
  /*
    create listing states
  */
  const [offeredTokenAddr, setOfferedTokenAddr] = useState("");
  const [offeredTokenAmt, setOfferedTokenAmt] = useState("");

  const [expectedTokenAddr, setExpectedTokenAddr] = useState("");
  const [customExpectedTokenAddr, setCustomExpectedTokenAddr] = useState("");
  const [expectedTokenAmt, setExpectedTokenAmt] = useState("");

  const pressCreateListing = async () => {
    const { trxHash, err } = await listTokensUp(
      wallet,
      offeredTokenAddr,
      offeredTokenAmt,
      customExpectedTokenAddr ? customExpectedTokenAddr : expectedTokenAddr,
      expectedTokenAmt
    );
    if (err) {
      toast({
        title: "Something went wrong!",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Creating listing...",
        description: `Your transaction hash is: ${trxHash}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
    setOfferedTokenAddr("");
    setOfferedTokenAmt("");
    setExpectedTokenAddr("");
    setCustomExpectedTokenAddr("");
    setExpectedTokenAmt("");
    onClose();
  };

  return (
    <DrawerContent>
      <DrawerCloseButton />
      <DrawerHeader>Create a new listing 🚀</DrawerHeader>

      <DrawerBody display="flex" flexDir="column" rowGap="8">
        <FormControl isRequired>
          <FormLabel>Bid Token</FormLabel>
          <Select
            placeholder="Select bid token"
            onChange={(e) => {
              setOfferedTokenAddr(e.target.value);
              setOfferedTokenAmt("");
            }}
          >
            <option value={gytAddr}>GYT ({gytAddr})</option>
            <option value={gntAddr}>GNT ({gntAddr})</option>
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Bid Token Amount</FormLabel>
          {offeredTokenAddr && (
            <Text fontWeight="bold" mb="3">
              Available balance:
              <span style={{ marginLeft: "5px" }}>
                {offeredTokenAddr === gytAddr ? gytBalance : gntBalance}
              </span>
            </Text>
          )}

          <NumberInput
            value={offeredTokenAmt}
            min={1}
            max={offeredTokenAddr === gytAddr ? gytBalance : gntBalance}
            onChange={(v) => setOfferedTokenAmt(v)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Ask Token</FormLabel>
          <Select
            placeholder="Select ask token"
            onChange={(e) => {
              if (e.target.value !== "custom") {
                setCustomExpectedTokenAddr("");
              }
              setExpectedTokenAddr(e.target.value);
              setExpectedTokenAmt("");
            }}
          >
            <option value={gytAddr}>GYT ({gytAddr})</option>
            <option value={gntAddr}>GNT ({gntAddr})</option>
            <option value={hmtknAddr}>HMTKN ({hmtknAddr})</option>
            <option value="custom">Custom Token</option>
          </Select>
        </FormControl>
        {expectedTokenAddr === "custom" && (
          <>
            <FormControl isRequired>
              <FormLabel>Custom token address</FormLabel>
              <Input
                onChange={(e) => {
                  setCustomExpectedTokenAddr(e.target.value);
                }}
                value={customExpectedTokenAddr}
              />
              <Text fontSize="sm" mt="3">
                We allow any token that implements the{" "}
                <Code
                  fontSize="sm"
                  children="IListableToken"
                  colorScheme="teal"
                />{" "}
                interface to be listed on our frontend. If you are looking to
                trade HwangMarket games' tokens across different games, this is
                fully supported, just enter the token's address. However, if you
                are looking to trade a different{" "}
                <Code fontSize="sm" children="ERC20" colorScheme="yellow" />{" "}
                compliant token minted outside of HwangMarket, unless the other
                token is compliant with{" "}
                <Code
                  fontSize="sm"
                  children="IListableToken"
                  colorScheme="teal"
                />
                , our frontend does not support that, although it is entirely
                possible to still perform the swap so long as it is{" "}
                <Code fontSize="sm" children="ERC20" colorScheme="yellow" />{" "}
                compliant, just not via the UI we have built out. We answer this
                in more detail under our{" "}
                <Link color="teal.500" as={routerLink} to="/faq">
                  FAQ
                </Link>
                .
              </Text>
            </FormControl>
          </>
        )}

        <FormControl isRequired>
          <FormLabel>Ask Token Amount</FormLabel>
          <NumberInput
            value={expectedTokenAmt}
            min={1}
            onChange={(v) => setExpectedTokenAmt(v)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <Box ml="auto" my="6">
          <Button
            variant="outline"
            mr={3}
            onClick={onClose}
            colorScheme="telegram"
          >
            Cancel
          </Button>
          <Button
            colorScheme="whatsapp"
            variant="outline"
            onClick={pressCreateListing}
          >
            Create
          </Button>
        </Box>
      </DrawerBody>
      <DrawerFooter>
        <Heading as="cite" fontSize="md" fontWeight="bold" mx="auto" my="15">
          <span style={{ marginRight: "15px" }}>⭐</span> "Fortune Favours The
          Brave" - Virgil <span style={{ marginLeft: "15px" }}>⭐</span>
        </Heading>
      </DrawerFooter>
    </DrawerContent>
  );
}
