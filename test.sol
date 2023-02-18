//SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract simpleCarreceipt is ERC1155 {
    uint256 public carCounter;
    constructor () public ERC1155 ("CarReceipt", "CAR") {
        carCounter = 1;
    }

    function createCarReceipt(string memory tokenURI) public return (uint256) {
        carCounter = carCounter + 1;
        _safeMint(msg.sender, carCounter);
        _setTokenURI(carCounter, tokenURI);
    }

    function getCarReceipt(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

}