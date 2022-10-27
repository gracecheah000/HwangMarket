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
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import {
  approveMainTokenSender,
  getMainToken2SenderApprovalAmt,
  getMainTokenBalance,
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
      <AlertDialogHeader>Increase allowance</AlertDialogHeader>
      <AlertDialogCloseButton />

      <AlertDialogBody>
        {isLoading ? (
          <Box display="flex" columnGap="3" alignItems="center">
            <Text>Fetching your balance</Text>
            <Spinner color="red" />
          </Box>
        ) : (
          <Box>
            <Heading size="sm" mb="3">
              HMTKN balance: {mainTknBalance}
            </Heading>
            <Text>Amount to allow: {allowAmt}</Text>
            {allowAmt > mainTknBalance && (
              <Box display="flex" alignItems="center" mt="2">
                <FontAwesomeIcon
                  icon={faX}
                  color="red"
                  style={{ marginRight: "5px" }}
                />
                <Text>
                  You cannot allow more than you own. Get more HMTKN and try
                  again.
                </Text>
              </Box>
            )}
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
