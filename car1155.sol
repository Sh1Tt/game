// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract NewCar is ERC1155, Ownable {
    address private _owner;
    string public car_unique_id = "0x00e005a6654287e8736";

    constructor() ERC1155("") {
        _owner = msg.sender;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        _owner = newOwner;
    }

    function read() public view returns (string memory) {
        return car_unique_id;
    }
}