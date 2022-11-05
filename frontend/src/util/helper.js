import chains from "./chains.json";

export const shortenAddr = (addr) => {
  return String(addr).substring(0, 6) + "..." + String(addr).substring(38);
};

export const eth2MainConversionRate = 1; // this is a fixed constant
export const game2MainConversionRate = 1; // this is a fixed constant

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/*
  {
    "name": "GoChain",
    "chain": "GO",
    "rpc": [
      "https://rpc.gochain.io"
    ],
    "faucets": [
      "https://free-online-app.com/faucet-for-eth-evm-chains/"
    ],
    "nativeCurrency": {
      "name": "GoChain Ether",
      "symbol": "GO",
      "decimals": 18
    },
    "infoURL": "https://gochain.io",
    "shortName": "go",
    "chainId": 60,
    "networkId": 60,
    "slip44": 6060,
    "explorers": [
      {
        "name": "GoChain Explorer",
        "url": "https://explorer.gochain.io",
        "standard": "EIP3091"
      }
    ]
  },
*/
export const identfyToken = (chainId) => {
  for (let i = 0; chains.length; i++) {
    if (parseInt(chainId) === parseInt(chains[i].chainId)) {
      return chains[i];
    }
  }

  return null;
};
