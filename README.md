# HwangMarket

## Truffle & Ganache

Truffle - a development environment utilizing the EVM (Ethereum Virtual Machine) as a basis.

Ganache - tool to set up your own local Ethereum blockchain that you can use to deploy and test your smart contracts/dApps before launching them on an authentic chain.

1. Download Ganache UI: https://trufflesuite.com/ganache/

   - Once downloaded, create an Ethereum workspace

2. Install Truffle and Ganache:

```
npm install -g truffle
npm install ganache
```

3. Configuring Truffle to connect to Ganache

   - Edit `truffle-config.js` to point to Ganache's IP and port
     ![image](https://user-images.githubusercontent.com/65240352/195336047-d847825e-1505-40fe-b7f2-939db8e435dc.png)

4. Link the Ganache instance to Truffle Project

   - Enter the settings
     ![image](https://user-images.githubusercontent.com/65240352/195335188-ca589438-62c5-4380-82f4-8fa7095cac6f.png)

   - Add Project under 'Workspace' section, selecting `truffle-config.js` in the Truffle project
     ![image](https://user-images.githubusercontent.com/65240352/195335284-5d638ece-e6ec-4314-9153-901957ff7ef5.png)

# Developing on local

#### 1. Enter developement console:

```
truffle console
```

#### 2. Compiling contracts ABI:

```
truffle(development)> compile
```

#### 3. Deploying to local ganache:

```
truffle(development)> migrate
```

#### 4. Deploying main HwangMarket contract

```
truffle(development)> let hMket = await HwangMarket.deployed();
undefined
```

![get funded test accounts](pics/hMket.png)

> Noob note: Returned output is undefined, but if you just enter hMket, you will see it is indeed deployed. It is only a problem if you get an error here. Obviously, you can also interact with the contract instance here, such as finding out its address and balance, etc.

#### 5. Create a new game contract via HwangMarket main contract

Call the createGame method. You can confirm the trx hash being returned.

```
truffle(development)> await hMket.createGame();
```

![get funded test accounts](pics/create_game.png)

#### 6. Get the address of the game contract that was just created.

To get the address of the game contract that was just created, we need to reference the HwangMarket main contract's public map `gameContractRegistry`.

```
truffle(development)> hMket.gameContractRegistry(0);
'0x625a021D3aa2Bf3E26eA455e3cF2e1AD7C83554D'
```

Alternatively, if you like pineapples on your pizzas,

```
truffle(development)> hMket.methods["gameContractRegistry(uint256)"].call(0);
'0x625a021D3aa2Bf3E26eA455e3cF2e1AD7C83554D'
```

#### 7. Get an instance of the game contract that was just created.

```
let gamba = await GameContract.at('0x625a021D3aa2Bf3E26eA455e3cF2e1AD7C83554D');
```

#### 8. Invoking the game contract's methods.

```
truffle(development)> gamba.getBalance();
BN { negative: 0, words: [ 0, <1 empty item> ], length: 1, red: null }
```

Now, lets see how we can play around in this test env, but first we need some funded accounts to play with. We can try to top up this game contract's balance.
To get a list of the funded local accounts available, each having 100 eth, we can run: `await web3.eth.getAccounts()`. This will be useful in getting some already funded accounts so we can just focus on development.
![get funded test accounts](pics/get_accs.png)

Below, shows a quick way to top up the `gamba` contract balance amount.

```
truffle(development)> gamba.getBalance();
BN { negative: 0, words: [ 0, <1 empty item> ], length: 1, red: null }

truffle(development)> const John = (await web3.eth.getAccounts())[0];
undefined

truffle(development)> gamba.sendTransaction({from: John, value:21})
{
  tx: '0x4d85042b958a82e9ae2ea421cdd76062bb4fde5eb4c007ee99c3e5ef2e034fdb',
  receipt: {
    transactionHash: '0x4d85042b958a82e9ae2ea421cdd76062bb4fde5eb4c007ee99c3e5ef2e034fdb',
    transactionIndex: 0,
    blockHash: '0xe27168428629c66cc6bdb9f1466f81bc7f580e990e0a656d86e58649b3d36e8d',
    blockNumber: 18,
    from: '0x2c9fd0018863a6937ed17518f428102ec9fee61f',
    to: '0x8b459607ef7b1e64f7c66e94920305b7d3ed37af',
    gasUsed: 21055,
    cumulativeGasUsed: 21055,
    contractAddress: null,
    logs: [],
    status: true,
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    rawLogs: []
  },
  logs: []
}

truffle(development)> await gamba.getBalance();
BN { negative: 0, words: [ 21, <1 empty item> ], length: 1, red: null }
```

#### Adding a player to YES side.

```
truffle(development)> const ga = await GameContract.at('0xf4A41837A929bc9Aea65085a6cf71969B9514bF8');
undefined
truffle(development)> ga.getSideAmt(0);
BN { negative: 0, words: [ 0, <1 empty item> ], length: 1, red: null }
truffle(development)> ga.getSideAmt(1);
BN { negative: 0, words: [ 0, <1 empty item> ], length: 1, red: null }
truffle(development)> ga.addPlayer(John, 21, 1, {value: 21});
{
  tx: '0xbb0a0543dfe81b446ec4befd2e916072996ffe92238d138b42f208ed694c8cef',
  receipt: {
    transactionHash: '0xbb0a0543dfe81b446ec4befd2e916072996ffe92238d138b42f208ed694c8cef',
    transactionIndex: 0,
    blockHash: '0x2b368d14d84affc466e088f9cd733f9e001a3b53e5c67c7518a93ee155e367a0',
    blockNumber: 36,
    from: '0x2c9fd0018863a6937ed17518f428102ec9fee61f',
    to: '0xf4a41837a929bc9aea65085a6cf71969b9514bf8',
    gasUsed: 86624,
    cumulativeGasUsed: 86624,
    contractAddress: null,
    logs: [],
    status: true,
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    rawLogs: []
  },
  logs: []
}
truffle(development)> ga.getSideAmt(1);
BN { negative: 0, words: [ 21, <1 empty item> ], length: 1, red: null }
truffle(development)> ga.getBalance();
BN { negative: 0, words: [ 21, <1 empty item> ], length: 1, red: null }
truffle(development)> ga.betRecords(John);
BN { negative: 0, words: [ 21, <1 empty item> ], length: 1, red: null }
truffle(development)> ga.betSides(John);
BN { negative: 0, words: [ 1, <1 empty item> ], length: 1, red: null }
truffle(development)> ga.getSideAmt(0);
BN { negative: 0, words: [ 0, <1 empty item> ], length: 1, red: null }
```

#### Adding another player

Since the `addPlayer` method requires that the sender is the player, you have to specify the optional from if you wish to submit on behalf of another user.

```
truffle(development)> const Sandy = (await web3.eth.getAccounts())[1];
undefined
truffle(development)> ga.addPlayer(Sandy, 13, 0, {value: 13, from: Sandy});
{
  tx: '0x21654b61a5befce01d88403dabb9fa4d3fe460684846b65e381c39ca25a3ce39',
  receipt: {
    transactionHash: '0x21654b61a5befce01d88403dabb9fa4d3fe460684846b65e381c39ca25a3ce39',
    transactionIndex: 0,
    blockHash: '0x57f12d17f807cee6bf88bdacd9eb2c4e6185d4392b5e1917bcea00a732e020d3',
    blockNumber: 37,
    from: '0x08a5c12e1488174e19c3fbac4a72995185bc190f',
    to: '0xf4a41837a929bc9aea65085a6cf71969b9514bf8',
    gasUsed: 86587,
    cumulativeGasUsed: 86587,
    contractAddress: null,
    logs: [],
    status: true,
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    rawLogs: []
  },
  logs: []
}
truffle(development)> ga.getSideAmt(0);
BN { negative: 0, words: [ 13, <1 empty item> ], length: 1, red: null }
truffle(development)> ga.getSideAmt(1);
BN { negative: 0, words: [ 21, <1 empty item> ], length: 1, red: null }
```

## Connecting to Goerli test network

#### 1. Run the truffle console in goerli network.

Already configured in `truffle-config.js`. You only need to run:

```
npx truffle console --network goerli
```

This is useful for connecting to chainlink, since using chainlink in local ganache requires us forking the block and running it locally on our network.

#### 2. Top up your test wallet.

First, check your wallet's balance, which should be zero initially. Then, request for a top up in [goerli faucet](https://goerlifaucet.com/).

Paste the following address into the wallet address input on goerli faucet.

```
❯ npx truffle console --network goerli
truffle(goerli)> await web3.eth.getBalance(accounts[0])
'0'
truffle(goerli)> accounts[0]
'0x6Fe9af369bF80b2D18f66a5606383a5f8f83eC9B'

// after getting some goerli eth
truffle(goerli)> await web3.eth.getBalance(accounts[0])
'100000000000000000'
```

#### 3. Developing on the testnet

Just run `compile` and `migrate` to compile and deploy the contract like in local ganache.

```
truffle(goerli)> compile

Compiling your contracts...
===========================
> Compiling ./contracts/GameContract.sol
> Compiling ./contracts/HwangMarket.sol
> Compilation warnings encountered:

    Warning: Visibility for constructor is ignored. If you want the contract to be non-deployable, making it "abstract" is sufficient.
  --> project:/contracts/HwangMarket.sol:12:3:
   |
12 |   constructor() public {
   |   ^ (Relevant source part starts here and spans across multiple lines).


> Artifacts written to /Users/gerald/Desktop/HwangMarket/build/contracts
> Compiled successfully using:
   - solc: 0.8.17+commit.8df45f5f.Emscripten.clang
truffle(goerli)> migrate

Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.


Starting migrations...
======================
> Network name:    'goerli'
> Network id:      5
> Block gas limit: 30000000 (0x1c9c380)


2_deploy_contracts.js
=====================

   Deploying 'HwangMarket'
   -----------------------
   > transaction hash:    0x7ea92d9eb1314fa62550b44ce11209647b4c25716730c6b6c8ca002fb03b1f64
   > Blocks: 2            Seconds: 25
   > contract address:    0x0b0A553581c91FB635e8D28C9b8a8D4C8273A456
   > block number:        7791142
   > block timestamp:     1666099032
   > account:             0x6Fe9af369bF80b2D18f66a5606383a5f8f83eC9B
   > balance:             0.09047221062612016
   > gas used:            1567776 (0x17ec20)
   > gas price:           6.077264465 gwei
   > value sent:          0 ETH
   > total cost:          0.00952778937387984 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 7791143)
   > confirmation number: 2 (block: 7791144)
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.00952778937387984 ETH

Summary
=======
> Total deployments:   1
> Final cost:          0.00952778937387984 ETH

```

You can also view the above trx on etherscan for goerli:
https://goerli.etherscan.io/tx/0x7ea92d9eb1314fa62550b44ce11209647b4c25716730c6b6c8ca002fb03b1f64

#### Getting the latest price of ETH / USD from chainlink

```
truffle(goerli)>  ( await gamba.getLatestPrice()).toString();
'133160765596'
truffle(goerli)>  ( await gamba.getLatestPrice()).toString();
'132482575965'
```

The value is repesented with 8 decimal points and the price only updates when a 1% deviation is recorded. Reference for other price feeds on goerli testnet:
https://docs.chain.link/docs/data-feeds/price-feeds/addresses/

# Running the entire test contract

1. Create the HwangMarket contract in goerli test net.
2. Configure accounts list to use those accounts with balance in them.

```
// replace accounts[i] with whatever you want.
truffle(goerli)> let accounts = await web3.eth.getAccounts();

// as an example
truffle(goerli)> Sandy = accounts[1]
```

3. Create the game contract and hold a reference to its instance by looking up its address in the main contract's game registry mapping.
4. Add players to any side

```
truffle(goerli)> x.addPlayer(Sandy, 3, 1, {value: 3, from: Sandy});
truffle(goerli)> x.addPlayer(accounts[0], 3, 0, {value: 3, from: accounts[0]});
```

> Note you would most likely need to specify the optional from param, since we assert that only players can self register, we cannot register on their behalf. 5. Run the perform upkeep function whenever ready.

```
truffle(goerli)> await x.performUpkeep();
```

6. Then withdraw a player's winnings whenever.

```
truffle(goerli)> await x.withdrawWinnings(Sandy);

truffle(goerli)> await web3.eth.getBalance(Sandy)
'20904606684859864'
```

Boom, we should have a basic contract that bets if ETH / USD is at least 1350 after 5 minutes when the contract is already created. The next goal would be to then focus on making contract creation more flexible since the above is only an example for what a game could look like.
