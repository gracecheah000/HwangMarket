import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogCloseButton,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  useColorMode,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import {
  approveMainTokenSender,
  getMainToken2SenderApprovalAmt,
  getMainTokenBalance,
  hwangMarketAddr,
} from "../../util/interact";

export default function IncreaseAllowanceDialog({
  wallet,
  gameAddr,
  onClose,
  allowAmt,
  setMain2TknAllowance,
}) {
  const [mainTknBalance, setMainTknBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { colorMode } = useColorMode();

  useEffect(() => {
    const getBalance = async () => {
      setIsLoading(true);
      setMainTknBalance(await getMainTokenBalance(wallet));
      setIsLoading(false);
    };
    getBalance();
  }, [wallet]);

  const doApprove = async () => {
    await approveMainTokenSender(wallet, gameAddr, allowAmt);
    setMain2TknAllowance(
      await getMainToken2SenderApprovalAmt(wallet, gameAddr)
    );
    onClose();
  };

  return (
    <>
      <AlertDialogHeader>Increase allowance 🚀</AlertDialogHeader>
      <AlertDialogCloseButton />

      <AlertDialogBody>
        {isLoading ? (
          <Box display="flex" columnGap="3" alignItems="center">
            <Text>Fetching your balance</Text>
            <Spinner color="red" />
          </Box>
        ) : (
          <Box>
            <Box display="flex" alignItems="center" columnGap="2">
              <Text>Your HMTKN balance:</Text>
              <Heading size="sm">{mainTknBalance} HMTKN</Heading>
            </Box>
            <Box display="flex" alignItems="center" my="3" columnGap="2">
              <Text>Allowance amount:</Text>
              <Heading size="sm">{allowAmt} HMTKN</Heading>
            </Box>
            <Box display="flex" alignItems="center" columnGap="2">
              <Text>Approved sender:</Text>
              <Heading size="sm">{gameAddr}</Heading>
            </Box>
            {allowAmt > mainTknBalance && (
              <Box
                display="flex"
                alignItems="center"
                my="2"
                border="1px solid red"
                borderRadius="15px"
                textAlign="center"
                px="6"
                py="2.5"
              >
                <FontAwesomeIcon
                  icon={faX}
                  color="red"
                  style={{ marginRight: "16px" }}
                />
                <Text>
                  You cannot allow more than you own. Get more HMTKN and try
                  again.
                </Text>
              </Box>
            )}
            <Box my="5">
              <Heading size="md" my="2">
                FAQ 🙋
              </Heading>
              <Accordion maxW="550px" allowToggle>
                <AccordionItem>
                  <Heading>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        What does it mean to approve?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Heading>
                  <AccordionPanel pb={4}>
                    Our tokens (
                    <span style={{ fontWeight: "bold" }}>
                      HMTKN and other game tokens
                    </span>
                    ) all conform to the{" "}
                    <Link
                      isExternal
                      href={
                        "https://docs.openzeppelin.com/contracts/2.x/api/token/erc20#IERC20"
                      }
                      color={colorMode === "light" ? "teal.700" : "teal.300"}
                    >
                      IERC20 token standard
                    </Link>
                    . This means that for all transactions involving a third
                    party contract to safely execute a transfer on behalf of
                    you, you would have to explicitly give it permission to do
                    so. In this case, you are allowing this specific game
                    contract to transfer your{" "}
                    <span style={{ fontWeight: "bold" }}>HMTKN</span> tokens out
                    of your balance in exchange for the game token.
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <Heading>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        How do I know I can trust you?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Heading>
                  <AccordionPanel pb={4}>
                    Fantastic question! Here at HwangMarket<span>&copy;</span>,
                    we pride ourselves on transparency and urge you to in fact
                    not trust us, or anyone on the internet for that matter! Our
                    contracts are available to be reviewed in full{" "}
                    <Link
                      isExternal
                      color={colorMode === "light" ? "teal.700" : "teal.300"}
                      href={`https://goerli.etherscan.io/address/${hwangMarketAddr}`}
                    >
                      here
                    </Link>
                    .
                  </AccordionPanel>
                </AccordionItem>

                <AccordionItem>
                  <Heading>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Does this mean I get my game tokens after approving?
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </Heading>
                  <AccordionPanel pb={4}>
                    No, approving does not actually transfer any tokens. Your{" "}
                    <span style={{ fontWeight: "bold" }}>HMTKN</span> tokens are
                    still all intact with you until you actually complete the
                    transaction by pressing the Mint Game Tokens button later.
                    In which case, the actual exchange of your{" "}
                    <span style={{ fontWeight: "bold" }}>HMTKN</span> tokens for
                    the requested game tokens are executed.
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
          </Box>
        )}
      </AlertDialogBody>

      <AlertDialogFooter>
        {allowAmt > mainTknBalance ? (
          <Button colorScheme="telegram" variant="outline" onClick={onClose}>
            Acknowledge
          </Button>
        ) : (
          <Button colorScheme="green" variant="outline" onClick={doApprove}>
            Approve
          </Button>
        )}
      </AlertDialogFooter>
    </>
  );
}
