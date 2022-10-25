const { alchemyApiKey, mnemonic } = require("./secrets.json");
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "5777", // Any network (default: none)
      websockets: true,
    },

    //
    // Useful for deploying to a public network.
    // Note: It's important to wrap the provider as a function to ensure truffle uses a new provider every time.
    goerli: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://eth-goerli.g.alchemy.com/v2/${alchemyApiKey}`
        ),
      network_id: 5, // Goerli's id
      confirmations: 0, // # of confirmations to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
    },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17", // Fetch exact version from solc-bin (default: truffle's version)
      settings: {
        optimizer: {
          enabled: true,
          runs: 200, // Optimize for how many times you intend to run the code
        },
        evmVersion: "byzantium",
      },
    },
  },
};
