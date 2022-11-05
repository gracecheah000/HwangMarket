import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { ColorModeScript } from "@chakra-ui/react";
import { BrowserRouter, HashRouter } from "react-router-dom";

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <HashRouter>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </HashRouter>
  </ChakraProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
