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
} from "@chakra-ui/react";

export default function GameErrorDialog({ errorMsg, onClose }) {
  return (
    <>
      <AlertDialogHeader>Purchase failed</AlertDialogHeader>
      <AlertDialogCloseButton />
      <AlertDialogBody>
        <Text>Sorry, something went wong! Your funds are still safe.</Text>
        <Text>{errorMsg}</Text>
      </AlertDialogBody>

      <AlertDialogFooter>
        <Button colorScheme="telegram" variant="outline" onClick={onClose}>
          Acknowledge
        </Button>
      </AlertDialogFooter>
    </>
  );
}
