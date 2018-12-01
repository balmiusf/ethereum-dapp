This repository is for the process of development and deployment of a Decentralized Application on the Ethereum main net, test net (Rinkeby) and local node (Ganache). This Decentralized Application is being developed with the aid an eCourse. (https://www.udemy.com/getting-started-with-ethereum-solidity-development/)

This repository uses Truffle Framework and Solidity.

## Ganache (local node) 

1. Run Ganache
2. Deploy using `truffle`, specifying ganache as the network (reset is optional)
    ```javascript
    truffle migrate --compile-all --reset --network ganache
    ```
    Or alternatively.
    ```javascript
    truffle console --network ganache
    ```
    And within the truffle console execute the following command specifying ganache as the network.  (reset is optional)
    ```javascript
    migrate --compile-all --reset --network ganache
    ```
    

# ChainSkills Truffle Box

This Truffle Box has all you need to create a DApp by following the course delivered by [ChainSkills](https://www.udemy.com/getting-started-with-ethereum-solidity-development/).

This box has been based from [pet-shop-box](https://github.com/truffle-box/pet-shop-box).

## Installation

1. Install Truffle globally.
    ```javascript
    npm install -g truffle
    ```

2. Download the box. This also takes care of installing the necessary dependencies.
    ```javascript
    truffle unbox chainskills/chainskills-box
    ```

3. Run the development console.
    ```javascript
    truffle develop
    ```

4. Compile and migrate the smart contracts. Note inside the development console we don't preface commands with `truffle`.
    ```javascript
    compile
    migrate
    ```

5. Run the `liteserver` development server (outside the development console) for front-end hot reloading. Smart contract changes must be manually recompiled and migrated.
    ```javascript
    // Serves the front-end on http://localhost:3000
    npm run dev
    ```
