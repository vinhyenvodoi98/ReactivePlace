// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity >=0.8.0;

import { PlaceStruct } from "../helper/Structure.sol";
import '../../lib/reactive-lib/src/abstract-base/AbstractReactive.sol';
import '../../lib/reactive-lib/src/interfaces/IReactive.sol';

contract ReactivePlaceReactiveContract is IReactive, AbstractReactive {
    error AlreadyPlaced(string message, address user, uint256 roundNumber);
    uint256 private constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 private constant REACTIVE_CHAIN_ID = 5318008;
    uint256 private constant SEND_PLACE_TOPIC_0 = 0xe0ce97d3a34aa7535998a80d6f34dbe41b123afa2525798631ce458b3d8af1b9;
    uint64 private constant GAS_LIMIT = 1000000;

    // State specific to reactive network instance of the contract
    address private callback;

    constructor(address _service, address _callback_sender, address _callback) payable {
        service = ISystemContract(payable(_service));
        if (!vm) {
            service.subscribe(
                SEPOLIA_CHAIN_ID,
                _callback_sender,
                SEND_PLACE_TOPIC_0,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );
        }
        callback = _callback;
    }

    function react(LogRecord calldata log) external vmOnly {
        if (log.topic_0 == SEND_PLACE_TOPIC_0) {
            (uint8 x, uint8 y, string memory color) = abi.decode(log.data, (uint8, uint8, string));

            bytes memory payload = abi.encodeWithSignature("callback(uint8,uint8,string)", x, y, color);
            emit Callback(REACTIVE_CHAIN_ID, callback, GAS_LIMIT, payload);
        }
    }
}
