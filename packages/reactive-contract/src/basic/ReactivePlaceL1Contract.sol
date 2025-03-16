// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity >=0.8.0;

import { PlaceStruct } from "../helper/Structure.sol";

contract ReactivePlaceL1Contract {
    event Placed(
        uint8 x,
        uint8 y,
        string color
    );

    function sendPlace(PlaceStruct calldata _place) external {
        emit Placed(
            _place.x,
            _place.y,
            _place.color
        );
    }
}
