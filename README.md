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

##### 1. Enter developement console:

```
truffle console
```

##### 2. Compiling contracts ABI:

```
truffle(development)> compile
```

##### 3. Deploying to local ganache:

```
truffle(development)> migrate
```

##### 4. Deploying main HwangMarket contract

```
truffle(development)> let hMket = await HwangMarket.deployed();
undefined
```

![get funded test accounts](pics/hMket.png)

> Noob note: Returned output is undefined, but if you just enter hMket, you will see it is indeed deployed. It is only a problem if you get an error here. Obviously, you can also interact with the contract instance here, such as finding out its address and balance, etc.

##### 5. Create a new game contract via HwangMarket main contract

Call the createGame method. You can confirm the trx hash being returned.

```
truffle(development)> await hMket.createGame();
```

![get funded test accounts](pics/create_game.png)

##### 6. Get the address of the game contract that was just created.

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

##### 7. Get an instance of the game contract that was just created.

```
let gamba = await GameContract.at('0x625a021D3aa2Bf3E26eA455e3cF2e1AD7C83554D');
```

##### 8. Invoking the game contract's methods.

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
truffle(development)> const player1 = (await web3.eth.getAccounts())[0];

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
