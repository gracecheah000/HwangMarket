import { Box } from "@chakra-ui/react";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  return (
    <Box
      my="16"
      display="flex"
      flexDir="column"
      justifyContent="center"
      alignItems="center"
    >
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>Not Found</i>
      </p>
    </Box>
  );
}
