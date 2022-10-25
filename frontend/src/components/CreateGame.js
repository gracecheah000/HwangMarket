import {
  Box,
  Heading,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  Select,
  FormControl,
  FormLabel,
  Link,
  Badge,
  Tooltip,
  NumberInput,
  NumberInputField,
  Input,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLink,
  faPlus,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "./css/react-datepicker.css";
import { BigNumber } from "ethers";

import {
  hwangMarket,
  createAGame,
  getGameAddrById,
  getCurrentWalletConnected,
  connectWallet,
} from "../util/interact";

const CreateGame = ({ walletAddress, setStatus, colorMode }) => {
  const [resolveTime, setResolveTime] = useState(new Date());
  const [threshold, setThreshold] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState("");

  const [category, setCategory] = useState("");
  const allowedCategories = [
    "Price Feeds",
    "Sports",
    "NFTs",
    "Assets",
    "Weather",
  ];

  const [mkt, setMkt] = useState(null);
  const markets = {
    "Price Feeds": [
      {
        description: "BTC / ETH",
        oracleAddr: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 18,
      },
      {
        description: "BTC / USD",
        oracleAddr: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 8,
      },
      {
        description: "DAI / USD",
        oracleAddr: "0x0d79df66BE487753B02D015Fb622DED7f0E9798d",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 8,
      },
      {
        description: "ETH / USD",
        oracleAddr: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 8,
      },
      {
        description: "FORTH / USD",
        oracleAddr: "0x7A65Cf6C2ACE993f09231EC1Ea7363fb29C13f2F",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 8,
      },
      {
        description: "JPY / USD",
        oracleAddr: "0x295b398c95cEB896aFA18F25d0c6431Fd17b1431",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 18,
      },
      {
        description: "LINK / ETH",
        oracleAddr: "0xb4c4a493AB6356497713A78FFA6c60FB53517c63",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 18,
      },
      {
        description: "LINK / USD",
        oracleAddr: "0x48731cF7e84dc94C5f84577882c14Be11a5B7456",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 8,
      },
      {
        description: "Stader Labs PoR",
        oracleAddr: "0x3de1bE9407645533CD0CbeCf88dFE5297E7125e6",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 18,
      },
      {
        description: "Swell PoR",
        oracleAddr: "0xDe9C980F79b636B46b9c3bc04cfCC94A29D18D19",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 18,
      },
      {
        description: "USDC / USD",
        oracleAddr: "0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 8,
      },
      {
        description: "XAU / USD",
        oracleAddr: "0x7b219F57a8e9C7303204Af681e9fA69d17ef626f",
        provider: "Chainlink",
        providerLink: "https://chain.link/",
        dec: 18,
      },
    ],
  };

  const submitCreateGame = async () => {
    onClose();
    const parsedThreshold = BigNumber.from(threshold).mul(
      BigNumber.from(10).pow(mkt.dec)
    );
    const parsedResolveTime = parseInt(resolveTime.getTime() / 1000);
    const { status } = await createAGame(
      walletAddress,
      parsedResolveTime,
      mkt.oracleAddr,
      parsedThreshold,
      category,
      title
    );
    setStatus(status);
  };

  return (
    <Box>
      <Button
        leftIcon={<FontAwesomeIcon icon={faPlus} />}
        colorScheme="green"
        onClick={onOpen}
      >
        New Game
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new game</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mt="1" mb="5" isRequired>
              <FormLabel>Game category</FormLabel>
              <Select
                placeholder="Select a game category"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                {allowedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormControl>

            {category && (
              <FormControl my="5" isRequired>
                <FormLabel>Market</FormLabel>
                <Select
                  placeholder="Select a market"
                  onChange={(e) =>
                    setMkt(
                      markets[category].find(
                        (m) => m.description === e.target.value
                      )
                    )
                  }
                  value={mkt ? mkt.description : ""}
                >
                  {markets[category] &&
                    markets[category].map((o) => (
                      <option key={o.description} value={o.description}>
                        {o.description}
                      </option>
                    ))}
                </Select>
              </FormControl>
            )}

            {category && mkt && (
              <Box
                display="flex"
                flexDir="column"
                rowGap="2"
                justifyContent="center"
              >
                <Box
                  border="2px solid teal"
                  borderRadius="15px"
                  p="5"
                  bgColor={colorMode === "light" ? "teal.100" : "cyan.700"}
                  my="2"
                >
                  <Box display="flex" alignItems="center" mb="2" columnGap="3">
                    <Heading size="md">Oracle information</Heading>
                    <Tooltip
                      label="We only use verified oracles for our data feeds. Find out more in our FAQ."
                      placement="right"
                    >
                      <FontAwesomeIcon icon={faQuestionCircle} />
                    </Tooltip>
                  </Box>

                  <Text>
                    Resolver:{" "}
                    <Badge mx="1" mr="4" colorScheme="blue" variant="outline">
                      <Link isExternal href={mkt.providerLink}>
                        {mkt.provider} <FontAwesomeIcon icon={faExternalLink} />
                      </Link>
                    </Badge>
                  </Text>
                  <Text>
                    Contract address:{" "}
                    <Link
                      isExternal
                      href={`https://goerli.etherscan.io/address/${mkt.oracleAddr}`}
                    >
                      {mkt.oracleAddr} <FontAwesomeIcon icon={faExternalLink} />
                    </Link>
                  </Text>
                </Box>

                <FormControl isRequired mt="2" mb="2">
                  <FormLabel>Title</FormLabel>
                  <Input
                    placeholder="Enter a short title describing the game"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired my="5">
                  <FormLabel>Resolution time</FormLabel>
                  <DatePicker
                    id={colorMode === "dark" && "darkmode"}
                    selected={resolveTime}
                    onChange={(datetime) => setResolveTime(datetime)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                  />
                </FormControl>
                <FormControl isRequired my="5">
                  <FormLabel>Price Threshold (in terms of base unit)</FormLabel>
                  <NumberInput
                    value={threshold}
                    onChange={(v) => setThreshold(v)}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </Box>
            )}
          </ModalBody>

          <ModalFooter
            display="flex"
            alignItems="center"
            justifyContent="center"
            columnGap="14"
          >
            <Button
              colorScheme="green"
              w="80%"
              variant="outline"
              onClick={submitCreateGame}
              isDisabled={!category || !mkt || !resolveTime}
            >
              Create game
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CreateGame;
