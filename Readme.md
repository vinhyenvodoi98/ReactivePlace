# Super/Place
## Description
We are fans of the game r/place game on reddit which have a large and united community. I want blockchain users like that too. That's the inspiration for us to create **super/place**.

Super/Place's interesting point is that we use worldID to verify user to avoid bot attacks.
We deploy the contract on the OP-goerli chain and we allow people from different chains to play it without having to transfer their ETH from the their chain to the op-goerli

The game logic is that it will split into rounds where each round is 3 minutes. In those 3 minutes, each user can only place one pixel. Then, Let's create great drawings together.

We support mint nft users with zora at a moment to help them create interesting nft

We also want to create competition from chains by counting the number of pixels sent from which chains to help us easily identify which chain's community is strongest.

## How we build it

We have tried to integrate great services from partners
- We used worldID for onchain user authentication
- To be able to communicate cross-chain we use hyperlane
- We use zora to create snapshot nft
- We deploy contract sender on chains like: goerli, basegoerli, zoratest and main contract in op-goerli
- We use nextjs, wagmi, worldCoin SDK to build frontend
- We use Hardhat to deploy contract
