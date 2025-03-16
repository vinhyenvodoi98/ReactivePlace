# Multi-Chain Reactive Place

## Overview
A decentralized version of Reddit's r/place, allowing users to collaboratively create pixel art across multiple blockchains. Players can participate from either Sepolia or Reactive testnet, creating a unified canvas that bridges different blockchain communities.

## Key Features
- **Multi-Chain Interaction**: Place pixels from either Sepolia or Reactive testnet
- **Time-Based Rounds**: Each round lasts 3 minutes, with users limited to one pixel placement per round
- **Collaborative Canvas**: 200x100 pixel grid where users collectively create artwork
- **Cross-Chain Communication**: Uses Reactive Network for seamless cross-chain pixel placement
- **Anti-Spam Protection**: One pixel per address per round to maintain fair participation

## Technical Architecture

### Smart Contracts
- `ReactivePlaceCallback.sol`: Main contract on Reactive testnet managing the canvas
- `ReactivePlaceL1Contract.sol`: Contract on Sepolia for initiating pixel placements

### Cross-Chain Flow
- Sepolia users -> ReactivePlaceL1Contract -> Reactive Network -> ReactivePlaceCallback
- Reactive users -> Direct interaction with ReactivePlaceCallback

### Game Mechanics
- Each pixel placement requires:
  - Coordinates (x, y)
  - Color (hex format)
  - Valid user address
- Round system prevents rapid canvas manipulation
- Cross-chain transactions automatically sync the canvas state

## How to Play
1. Connect wallet to either Sepolia or Reactive testnet
2. Select coordinates and color for your pixel
3. Place pixel (one per round)
4. Wait for next round (3 minutes) to place another pixel

## Technical Integration
```solidity
// Place a pixel
struct PlaceStruct {
    uint8 x;
    uint8 y;
    string color;
}

# Deploy Contract
Deploy the `ReactivePlaceL1Contract` contract and assign the `Deployed to` address from the response to `ORIGIN_ADDR`.

```bash
forge create --rpc-url $ORIGIN_RPC --private-key $ORIGIN_PRIVATE_KEY src/basic/ReactivePlaceL1Contract.sol:ReactivePlaceL1Contract --broadcast
```

### Step 2 — Destination Contract

Deploy the `ReactivePlaceL1Callback` contract and assign the `Deployed to` address from the response to `CALLBACK_ADDR`.

```bash
forge create --rpc-url $REACTIVE_RPC --private-key $REACTIVE_PRIVATE_KEY src/basic/ReactivePlaceCallback.sol:ReactivePlaceCallback --legacy --broadcast --value 0.0001ether --constructor-args $DESTINATION_CALLBACK_PROXY_ADDR
```

### Step 3 — Reactive Contract

Deploy the `ReactivePlaceReactiveContract` contract, configuring it to listen to `ORIGIN_ADDR` on `ORIGIN_CHAIN_ID` and to send callbacks to `CALLBACK_ADDR` on `DESTINATION_CHAIN_ID`. The `Received` event on the origin contract has a `topic_0` value of `0x8cabf31d2b1b11ba52dbb302817a3c9c83e4b2a5194d35121ab1354d69f6a4cb`, which we are monitoring.

```bash
forge create --rpc-url $REACTIVE_RPC --private-key $REACTIVE_PRIVATE_KEY src/basic/ReactivePlaceReactiveContract.sol:ReactivePlaceReactiveContract --legacy --broadcast --value 0.0001ether --constructor-args $SYSTEM_CONTRACT_ADDR $ORIGIN_ADDR $CALLBACK_ADDR
```

# Run Frontend

Navigate to the client directory and install dependencies:
```
pnpm run dev
```
