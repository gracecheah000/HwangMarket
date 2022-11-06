import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Code,
} from "@chakra-ui/react";
import { withdrawWinnings } from "../../util/interact";
import { shortenAddr } from "../../util/helper";
import { BigNumber } from "ethers";

export default function ClaimWinningDialog({
  wallet,
  gameAddr,
  outcome,
  onClose,
  withdrawAmt,
  hmtknAddr,
  winningTokenAddr,
  totalLoseAmt,
  totalWinAmt,
}) {
  const toast = useToast();

  const doClaimWinning = async () => {
    const { trxHash, err } = await withdrawWinnings(
      wallet,
      gameAddr,
      withdrawAmt
    );
    if (err) {
      toast({
        title: "Transaction failed!",
        description: `The transfer failed! Error: ${err}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      return;
    }
    toast({
      title: "Transfer processing!",
      description: `Your transaction hash is: ${trxHash}. This message will be removed in 20 seconds and lost permanently, save the transaction hash if you wish.`,
      status: "info",
      duration: 20000,
      isClosable: true,
    });
    onClose();
  };

  console.log(withdrawAmt, totalLoseAmt, totalWinAmt);
  const winningAmt = Math.floor(
    parseInt(withdrawAmt) +
      (parseInt(withdrawAmt) / parseInt(totalWinAmt)) * parseInt(totalLoseAmt)
  );

  return (
    <>
      <AlertDialogHeader>Claim Winning 🚀</AlertDialogHeader>
      <AlertDialogCloseButton />

      <AlertDialogBody>
        <Box>
          <Box display="flex" alignItems="center" columnGap="2">
            <Text>Approved sender:</Text>
            <Heading size="sm">{gameAddr}</Heading>
          </Box>
          <Box>
            <Heading mt="8" mb="4" size="sm">
              Transaction Summary
            </Heading>
            <StatGroup w="100%">
              <Stat>
                <StatLabel>HMTKN</StatLabel>
                <StatNumber>{winningAmt.toString()}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Gain {winningAmt.toString()} HMTKN
                </StatHelpText>
                <StatHelpText>
                  <Text fontSize="xs">{shortenAddr(hmtknAddr)}</Text>
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>{outcome === "1" ? "GYT" : "GNT"}</StatLabel>
                <StatNumber>{withdrawAmt}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  Lose {withdrawAmt} {outcome === "1" ? "GYT" : "GNT"}
                </StatHelpText>
                <StatHelpText>
                  <Text fontSize="xs">{shortenAddr(winningTokenAddr)}</Text>
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>
          <Box my="5">
            <Heading size="md" my="2">
              FAQ 🙋
            </Heading>
            <Accordion maxW="550px" allowToggle>
              <AccordionItem>
                <Heading>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      How are my winnings calculated?
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </Heading>
                <AccordionPanel pb={4}>
                  <Code fontSize="9pt">
                    Winnings = (Your ratio of the winning pool) * (total amount
                    in losing pool) + your initial deposit
                  </Code>
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
        <Button colorScheme="green" variant="outline" onClick={doClaimWinning}>
          Collect Winnings
        </Button>
      </AlertDialogFooter>
    </>
  );
}
