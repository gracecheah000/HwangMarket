import React from "react";
import {
  Box,
  Heading,
  Text,
  Link,
  Button,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogCloseButton,
  useColorMode,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";

export default function PurchaseConfirmationDialog({ trxHash, onClose }) {
  const { colorMode } = useColorMode();

  return (
    <>
      <AlertDialogHeader>Transaction confirmation 🚀</AlertDialogHeader>
      <AlertDialogCloseButton />
      <AlertDialogBody>
        <Text>You can monitor your transaction at:</Text>
        <Link
          fontWeight="bold"
          color={colorMode === "light" ? "teal.700" : "teal.300"}
          isExternal
          href={`https://goerli.etherscan.io/address/${trxHash}`}
        >
          {trxHash}
          <FontAwesomeIcon icon={faExternalLink} />
        </Link>
        <Text>No further actions are needed on your end.</Text>
        <Box pt="6" mb="-6">
          <Text mt="8" fontSize="11pt" as="cite">
            Good luck! And may the odds be ever in your favour. 🦉
          </Text>
        </Box>
      </AlertDialogBody>

      <AlertDialogFooter>
        <Button colorScheme="telegram" variant="outline" onClick={onClose}>
          Acknowledge
        </Button>
      </AlertDialogFooter>
    </>
  );
}
