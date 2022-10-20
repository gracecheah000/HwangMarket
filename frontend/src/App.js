import GamesGallery from "./components/GamesGallery";
import { Box, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CommonTop from "./components/CommonTop";

function App() {
  const [walletAddress, setWallet] = useState("");
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box>
      <CommonTop
        wallet={walletAddress}
        setWallet={setWallet}
        colorMode={colorMode}
        toggleColorMode={toggleColorMode}
      />
      <GamesGallery walletAddress={walletAddress} colorMode={colorMode} />
    </Box>
  );
}

export default App;
