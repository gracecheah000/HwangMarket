# Hwang Market

## Overview

This repository hosts the contracts behind Hwang Market and the frontend code in the frontend directory.

## Deployment

### On Goerli test net

Our contract and frontend is already deployed on a live URL on the Goerli test net: https://gracecheah000.github.io/HwangMarket/#/

### On local

However, you can also deploy on local if you are struggling on goerli testnet ETH.

We use the following:

Truffle - a development environment utilizing the EVM (Ethereum Virtual Machine) as a basis.

Ganache - tool to set up your own local Ethereum blockchain that you can use to deploy and test your smart contracts/dApps before launching them on an authentic chain.

1. Download Ganache UI: https://trufflesuite.com/ganache/

   - Once downloaded, create an Ethereum workspace

2. Install Truffle and Ganache:

```
npm install -g truffle
npm install ganache
```

3. Link the Ganache instance to Truffle Project

   - Enter the settings
     ![image](https://user-images.githubusercontent.com/65240352/195335188-ca589438-62c5-4380-82f4-8fa7095cac6f.png)

   - Add Project under 'Workspace' section, selecting `truffle-config.js` in the Truffle project
     ![image](https://user-images.githubusercontent.com/65240352/195335284-5d638ece-e6ec-4314-9153-901957ff7ef5.png)

4. Ensure all the project's dependencies are installed.

```
npm install
```

5. Enter truffle console. (Ensure your ganache server is running already.)
   `truffle console`

6. Deploy the contracts to your local network.
   `deploy`

7. Get the deployed contract address.

You should see an address for the deployed HwangMarket contract. Copy it, we will need it later.

```
Replacing 'HwangMarket'
   -----------------------
   > transaction hash:    0xd126090041e04c24ad018a3f9c362e6a0edd34f8bee120ffdc1f43159cdc7102
   > Blocks: 0            Seconds: 0
   > contract address:    0x17D3D710Db69DBB1e556977fdeBc43684A6d3A1d
   > block number:        1102
   > block timestamp:     1667738213
   > account:             0xc55De8931433adB28eE7767782E716dD00F7DEd9
   > balance:             27.419698219999972099
   > gas used:            1477489 (0x168b71)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.02954978 ETH

   > Saving artifacts
   -------------------------------------
   > Total cost:          0.16763068 ETH

Summary
=======
> Total deployments:   5
> Final cost:          0.16763068 ETH
```

In the above example, the contract address is: `0x17D3D710Db69DBB1e556977fdeBc43684A6d3A1d`

8. Setup react on your machine.
   https://reactjs.org/docs/getting-started.html

9. Change your working directory into the frontend directory.
   `cd frontend`

10. Install the frontend dependencies.
    `npm install`

11. Now, you will need to create a local file for local envs.
    Create a file called `.env.development` with the following contents:

```
REACT_APP_HwangMarket_Address = "YOUR_LOCALLY_DEPLOYED_CONTRACT_ADDRESS"
REACT_APP_Local_Provider = "ws://127.0.0.1:7545"
```

Please replace the hwang market address with the deployed contract address in step 7.

12. Now, we are ready to deploy it on local. Simply run:
    `npm run start`

## Development

To view development notes, refer to `DEVELOPMENT.md`.
