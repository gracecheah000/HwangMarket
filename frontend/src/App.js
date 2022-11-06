import GamesGallery from "./components/GamesGallery";
import { Box, useColorMode, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import CommonTop from "./components/CommonTop";
import ErrorPage from "./components/ErrorPage";
import { Routes } from "react-router-dom";

import {
  createBrowserRouter,
  RouterProvider,
  Route,
  HashRouter,
} from "react-router-dom";
import Game from "./components/Game";
import GetHMTKN from "./components/hmtknModals/GetHMTKN";
import PlayersHistory from "./components/PlayersHistory";

function App() {
  const [walletAddress, setWallet] = useState("");
  const { toggleColorMode } = useColorMode();
  const [gc1, setGC1] = useState(null);
  const [ctl, setCTL] = useState(null);
  const [pjl, setPJL] = useState(null);
  const [nl, setNL] = useState(null);
  const [lf, setLF] = useState(null);
  const [tknl, setTknL] = useState(null);
  const [yla, setYLA] = useState(null);
  const [ylt, setYLT] = useState(null);
  const [nla, setNLA] = useState(null);
  const [nlt, setNLT] = useState(null);
  const [gc, setGC] = useState(null);
  const [gal, setGAL] = useState(null);
  const [galf, setGALF] = useState(null);
  const [pjlf2, setPJL2] = useState(null);

  return (
    <Box>
      <CommonTop
        wallet={walletAddress}
        setWallet={setWallet}
        toggleColorMode={toggleColorMode}
        setCTL={setCTL}
      />
      <Routes>
        <Route
          exact
          path="/"
          element={
            <GamesGallery walletAddress={walletAddress} setGC1={setGC1} />
          }
        />
        <Route
          exact
          path="/game/:id"
          element={
            <Game
              wallet={walletAddress}
              setPJL={setPJL}
              setNL={setNL}
              setLF={setLF}
              setTknL={setTknL}
              setYLA={setYLA}
              setYLT={setYLT}
              setNLA={setNLA}
              setNLT={setNLT}
              setGC={setGC}
              setGAL={setGAL}
              setGALF={setGALF}
              setPJL2={setPJL2}
            />
          }
        />
        <Route
          exact
          path="/history"
          element={<PlayersHistory wallet={walletAddress} />}
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Box>
  );
}

export default App;
