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
    - Edit ```truffle-config.js``` to point to Ganache's IP and port
     ![image](https://user-images.githubusercontent.com/65240352/195336047-d847825e-1505-40fe-b7f2-939db8e435dc.png)
  
  4. Link the Ganache instance to Truffle Project
      
      - Enter the settings
      ![image](https://user-images.githubusercontent.com/65240352/195335188-ca589438-62c5-4380-82f4-8fa7095cac6f.png)
  
      - Add Project under 'Workspace' section, selecting ```truffle-config.js``` in the Truffle project
      ![image](https://user-images.githubusercontent.com/65240352/195335284-5d638ece-e6ec-4314-9153-901957ff7ef5.png)


