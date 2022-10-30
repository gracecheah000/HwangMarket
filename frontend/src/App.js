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
  const { toggleColorMode } = useColorMode();

  return (
    <Box>
      <CommonTop
        wallet={walletAddress}
        setWallet={setWallet}
        toggleColorMode={toggleColorMode}
      />
      <Routes>
        <Route
          exact
          path="/"
          element={<GamesGallery walletAddress={walletAddress} />}
        />
        <Route
          exact
          path="/game/:id"
          element={<Game wallet={walletAddress} />}
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Box>
  );
}

export default App;
