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
  useToast,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import {
  approveMainTokenSender,
  approveTokenSender,
  getMainToken2SenderApprovalAmt,
  getMainTokenBalance,
  getTokenAllowance,
  hwangMarketAddr,
} from "../../util/interact";

export default function ClaimWinningIncAllowanceDialog({
  wallet,
  gameAddr,
  outcome,
  onClose,
  approvalAmt,
  winningTokenAddr,
}) {
  const { colorMode } = useColorMode();
  const toast = useToast();

  const doApprove = async () => {
    const trxHash = await approveTokenSender(
      winningTokenAddr,
      wallet,
      gameAddr,
      approvalAmt
    );
    if (!trxHash) {
      toast({
        title: "Transaction failed!",
        description: "The approval failed!",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      return;
    }
    toast({
      title: "Approval processing!",
      description: `Your transaction hash is: ${trxHash}. This message will be removed in 20 seconds and lost permanently, save the transaction hash if you wish.`,
      status: "info",
      duration: 20000,
      isClosable: true,
    });
    onClose();
  };

  return (
    <>
      <AlertDialogHeader>Approve Winning Token Transfer 🚀</AlertDialogHeader>
      <AlertDialogCloseButton />

      <AlertDialogBody>
        <Box>
          <Box display="flex" alignItems="center" columnGap="2">
            <Text>Your winning token balance:</Text>
            <Heading size="sm">
              {approvalAmt} {outcome === "1" ? "GYT" : "GNT"}
            </Heading>
          </Box>
          <Box display="flex" alignItems="center" my="3" columnGap="2">
            <Text>Allowance amount to approve:</Text>
            <Heading size="sm">
              {approvalAmt} {outcome === "1" ? "GYT" : "GNT"}
            </Heading>
          </Box>
          <Box display="flex" alignItems="center" columnGap="2">
            <Text>Approved sender:</Text>
            <Heading size="sm">{gameAddr}</Heading>
          </Box>
          <Box my="5">
            <Heading size="md" my="2">
              FAQ 🙋
            </Heading>
            <Accordion maxW="540px" allowToggle>
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
                  . This means that for all transactions involving a third party
                  contract to safely execute a transfer on behalf of you, you
                  would have to explicitly give it permission to do so. In this
                  case, you are allowing this specific game contract to transfer
                  your <span style={{ fontWeight: "bold" }}>HMTKN</span> tokens
                  out of your balance in exchange for the game token.
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
                  Fantastic question! Here at HwangMarket<span>&copy;</span>, we
                  pride ourselves on transparency and urge you to in fact not
                  trust us, or anyone on the internet for that matter! Our
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
                      Does this mean I get my HMTKN winnings after approving?
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Heading>
                <AccordionPanel pb={4}>
                  No, approving does not actually transfer any tokens. Your{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {outcome === "1" ? "GYT" : "GNT"}
                  </span>{" "}
                  tokens are still all intact with you until you actually
                  complete the transaction by pressing the Mint Game Tokens
                  button later. In which case, the actual exchange of your{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {outcome === "1" ? "GYT" : "GNT"}
                  </span>{" "}
                  tokens for the requested HMTKN are executed.
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <Heading>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      How do I claim my winning in terms of ETH?
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Heading>
                <AccordionPanel pb={4}>
                  We currently only support exchanging winning tokens for HMTKN,
                  which you can than cash out for ETH, or the network's main
                  token, using the Cash out button on the top menu.
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </Box>
      </AlertDialogBody>

      <AlertDialogFooter>
        <Button colorScheme="green" variant="outline" onClick={doApprove}>
          Approve
        </Button>
      </AlertDialogFooter>
    </>
  );
}
