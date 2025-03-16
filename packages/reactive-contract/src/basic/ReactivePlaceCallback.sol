// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity >=0.8.0;

import { PlaceStruct } from "../helper/Structure.sol";
import '../../lib/reactive-lib/src/abstract-base/AbstractCallback.sol';

contract ReactivePlaceCallback is AbstractCallback {
    error AlreadyPlaced(string message, address user, uint256 roundNumber);

    mapping(uint256 => mapping(address => bool)) internal havePlace;
    string[200][100] public canvas;
    uint256 public currentRound;
    uint256 public test;

    event CallbackReceived(
        address indexed origin,
        address indexed sender,
        address indexed reactive_sender
    );

    event Placed(uint8 x, uint8 y, string color, address sender);

    constructor(address _callback_sender) AbstractCallback(_callback_sender) payable {}

    function place(PlaceStruct calldata _place) public {
        _internalPlace(_place, msg.sender);
    }

    function callback(uint8 _x, uint8 _y, string memory _color)
        external
        authorizedSenderOnly
        rvmIdOnly(msg.sender)
    {
        PlaceStruct memory _place = PlaceStruct({
            x: _x,
            y: _y,
            color: _color
        });
        _internalPlace(_place, msg.sender);
    }

    function _internalPlace(PlaceStruct memory _place, address _sender) internal {
        // each round is 3 minutes
        if (currentRound + 180 < block.timestamp) {
            currentRound = block.timestamp;
        }

        // First, we make sure this person hasn't done this before
        if (havePlace[currentRound][_sender]) revert AlreadyPlaced("You have already placed a pixel in this round", _sender, currentRound);

        // We now record the user has done this, so they can't do it again (proof of uniqueness)
        havePlace[currentRound][_sender] = true;

        canvas[_place.x][_place.y] = _place.color;
        emit Placed(_place.x, _place.y, _place.color, _sender);
    }

    function getCurrentBlockInfo() public view returns (uint, uint) {
        uint currentBlockNumber = block.number;
        uint currentTimestamp = block.timestamp;
        return (currentBlockNumber, currentTimestamp);
    }

    function getCanvas(uint8 x) public view returns (string[200] memory) {
        return canvas[x];
    }
}
