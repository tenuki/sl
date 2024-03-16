// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/interfaces/IERC20.sol";


struct Request {
    address requestedToken;
    uint256 requestedAmount;
    address offeredToken;
    uint256 offeredAmount;
}

struct Call {
    address target;
    bytes callData;
}

contract Borrower {
    uint public unlockTime;
    address payable public owner;
    Request[] public requests;

    event Withdrawal(uint amount, uint when);

    constructor(uint _unlockTime) payable {
//        require(
//            block.timestamp < _unlockTime,
//            "Unlock time should be in the future"
//        );
//        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function createRequest(address requestedToken, uint256 requestedAmount ,
                            address offeredToken, uint256 offeredAmount) public onlyOwner {
        Request memory request;
        request.offeredAmount = offeredAmount;
        request.offeredToken = offeredToken;
        request.requestedAmount = requestedAmount;
        request.requestedToken = requestedToken;
        requests.push(request);
    }

    function pendingRequests() public view returns(uint256) {
        return requests.length;
    }

    function lend(uint256 idx) public {
        Request memory request;
        request = requests[idx];
        IERC20 tokenRequested = IERC20(request.requestedToken);
        tokenRequested.transferFrom(msg.sender, address(this), request.requestedAmount);
    }

    //function execute(address target, bytes memory calldata) public onlyOwner returns (bytes memory) {
    function execute(address target, bytes memory xdata) public onlyOwner returns (bytes memory) {
        (bool success, bytes memory ret) = target.call(xdata);
        if (success) {
            verify();
        }
        return ret;
    }

    function verify() internal returns(bool) {
        return true;
    }

    function withdraw() public {
        // Uncomment this line, and the import of "hardhat/console.sol", to print a log in your terminal
        // console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}
