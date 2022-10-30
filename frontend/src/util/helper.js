export const shortenAddr = (addr) => {
  return String(addr).substring(0, 6) + "..." + String(addr).substring(38);
};

export const eth2MainConversionRate = 1; // this is a fixed constant
export const game2MainConversionRate = 1; // this is a fixed constant

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
