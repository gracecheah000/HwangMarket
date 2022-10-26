import GamesGallery from "./components/GamesGallery";
import { Box, useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CommonTop from "./components/CommonTop";
import ErrorPage from "./components/ErrorPage";
import { Routes } from "react-router-dom";

import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import Game from "./components/Game";

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
      <Routes>
        <Route
          exact
          path="/"
          element={
            <GamesGallery walletAddress={walletAddress} colorMode={colorMode} />
          }
        />
        <Route exact path="/:id" element={<Game />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Box>
  );
}

export default App;
