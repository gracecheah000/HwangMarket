export const shortenAddr = (addr) => {
  return String(addr).substring(0, 6) + "..." + String(addr).substring(38);
};
