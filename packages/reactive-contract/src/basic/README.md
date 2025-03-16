# Reactive Network Demo

## Overview

The **Reactive Network Demo** illustrates a basic use case of the Reactive Network with two key functionalities:

* Low-latency monitoring of logs emitted by the origin contract.
* Executing calls from the Reactive Network to the callback contract.

This setup can be adapted for various scenarios, from simple stop orders to fully decentralized algorithmic trading.

## Contracts

**Origin Contract**: [BasicDemoL1Contract](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/basic/BasicDemoL1Contract.sol) receives Ether and returns it to the sender, emitting a `Received` event with transaction details.

**Reactive Contract**: [ReactivePlaceReactiveContract](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/basic/ReactivePlaceReactiveContract.sol) demonstrates a reactive subscription model on Ethereum Sepolia. It listens for logs from a specified contract and emits an `Event` for each incoming log while incrementing a local `counter`. If the incoming log’s `topic_3` value is at least `0.01 Ether`, it emits a `Callback` event containing a payload to invoke a `callback` function externally.

**Destination Contract**: [ReactivePlaceL1Callback](https://github.com/Reactive-Network/reactive-smart-contract-demos/blob/main/src/demos/basic/ReactivePlaceL1Callback.sol) logs callback details upon receiving a call, capturing the origin, sender, and reactive sender addresses. It could also be a third-party contract.

## Further Considerations

The demo highlights just a subset of Reactive Network's features. Potential improvements include:

- **Enhanced Event Subscriptions**: Subscribing to multiple event origins, including callback logs, to maintain consistency.
- **Dynamic Subscriptions**: Allowing real-time adjustments to subscriptions based on conditions.
- **State Management**: Introducing persistent state handling for more complex, context-aware reactions.
- **Flexible Callbacks**: Supporting arbitrary transaction payloads to increase adaptability.

## Deployment & Testing

### Environment Variables

Before proceeding further, configure these environment variables:

* `ORIGIN_RPC` — RPC URL for the origin chain, (see [Chainlist](https://chainlist.org)).
* `ORIGIN_CHAIN_ID` — ID of the origin blockchain (see [Reactive Docs](https://dev.reactive.network/origins-and-destinations#mainnet-chains)).
* `ORIGIN_PRIVATE_KEY` — Private key for signing transactions on the origin chain.
* `DESTINATION_RPC` — RPC URL for the destination chain, (see [Chainlist](https://chainlist.org)).
* `DESTINATION_CHAIN_ID` — ID of the destination blockchain (see [Reactive Docs](https://dev.reactive.network/origins-and-destinations#mainnet-chains)).
* `DESTINATION_PRIVATE_KEY` — Private key for signing transactions on the destination chain.
* `REACTIVE_RPC` — RPC URL for the Reactive Network (see [Reactive Docs](https://dev.reactive.network/reactive-mainnet)).
* `REACTIVE_PRIVATE_KEY` — Private key for signing transactions on the Reactive Network.
* `SYSTEM_CONTRACT_ADDR` — The service address on the Reactive Network (see [Reactive Docs](https://dev.reactive.network/reactive-mainnet#overview)).
* `DESTINATION_CALLBACK_PROXY_ADDR` — The service address on the destination chain (see [Reactive Docs](https://dev.reactive.network/origins-and-destinations#callback-proxy-address)).

**Faucet**: To receive testnet REACT, send SepETH to the Reactive faucet contract on Ethereum Sepolia: `0x9b9BB25f1A81078C544C829c5EB7822d747Cf434`. The factor is 1/10 (or 0.1), meaning you get 0.01 REACT for every 0.1 SepETH sent.

### Step 1 — Origin Contract

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

### Step 4 — Test Reactive Callback

Test the whole setup by sending some ether to `ORIGIN_ADDR`:

```bash
cast send $ORIGIN_ADDR --rpc-url $ORIGIN_RPC --private-key $ORIGIN_PRIVATE_KEY --value 0.01ether
```

Ensure that the value sent is at least 0.01 ether, as this is the minimum required to trigger the process. Meeting this threshold will prompt the Reactive Network to initiate a callback transaction to `CALLBACK_ADDR` like shown [here](https://sepolia.etherscan.io/address/0x26fF307f0f0Ea0C4B5Df410Efe22754324DACE08#events).
