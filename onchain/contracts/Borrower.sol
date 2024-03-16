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

contract Borrower {
    uint public unlockTime;
    address payable internal owner;
    Request[] internal requests;
    mapping(address => uint) public locked;
    address[] internal tokens;

    function getOwner() public returns(address) {
        return owner;
    }

    constructor(address _owner) payable {
//        require(
//            block.timestamp < _unlockTime,
//            "Unlock time should be in the future"
//        );
//        unlockTime = _unlockTime;
        owner = payable(_owner);
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
        lock(idx, request.offeredToken, request.offeredAmount);
        add_token_to_mapped(request.offeredToken);
    }

    function add_token_to_mapped(address token) internal {
        for(uint256 idx=0;idx<tokens.length;idx++) {
            if(tokens[idx]==token) {
                //not to be added => nothing more must be done..
                return ;
            }
        }
        // elsewhere setup the token in the list...
        tokens.push(token);
    }

    function lock(uint256 idx, address token, uint256 amount) internal {
        ensure_free(token, amount);
        locked[token] = locked[token] + amount;
    }
    function ensure_free(address token, uint256 amount) internal {
        IERC20 Token = IERC20(token);
        if (amount>Token.balanceOf(address(this))-locked[token]) {
            revert("not enough collateral to reserve");
        }
    }

    //function execute(address target, bytes memory calldata) public onlyOwner returns (bytes memory) {
    function execute(address target, bytes memory xdata) public onlyOwner returns (bytes memory) {
        (bool success, bytes memory ret) = target.call(xdata);
        if (success) {
            verify();
        }
        return ret;
    }

    function verify() internal{
        for(uint256 idx=0;idx<tokens.length;idx++) {
            IERC20 Token = IERC20(tokens[idx]);
            if (Token.balanceOf(address(this))<locked[address(Token)]) {
                revert("transaction used locked collateral!");
            }
        }
    }

//    function withdraw() public {
//        require(block.timestamp >= unlockTime, "You can't withdraw yet");
//        require(msg.sender == owner, "You aren't the owner");
//
//        emit Withdrawal(address(this).balance, block.timestamp);
//        owner.transfer(address(this).balance);
//    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}
