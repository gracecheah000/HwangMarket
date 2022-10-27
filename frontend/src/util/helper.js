export const shortenAddr = (addr) => {
  return String(addr).substring(0, 6) + "..." + String(addr).substring(38);
};

export const game2MainConversionRate = 1; // this is a fixed constant
