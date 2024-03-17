// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/interfaces/IERC20.sol";


struct Request {
    // basic fields
    address requestedToken;
    uint256 requestedAmount;
    address offeredToken;
    uint256 offeredAmount;
    bool inProgress;
    bool completed;
    // -- when active/in progress
    address lender;
    uint256 returnedAmount;
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
        request.inProgress = false; // unnecessary..
        request.completed = false; // unnecessary..
        request.returnedAmount = 0; // unnecessary..
        requests.push(request);
    }

    function pendingRequests() public view returns(uint256) {
        return requests.length;
    }

    function getState(uint256 idx) public view returns (bool inProgress, bool completed) {
        return (requests[idx].inProgress, requests[idx].completed);
    }

    function lend(uint256 idx) public {
        Request memory request = requests[idx];
        require(request.inProgress==false, "request already in progress");
        require(request.completed==false, "request already completed");
        IERC20 tokenRequested = IERC20(request.requestedToken);
        tokenRequested.transferFrom(msg.sender, address(this), request.requestedAmount);
        lock(idx, request.offeredToken, request.offeredAmount);
        add_token_to_mapped(request.offeredToken);
        request.inProgress = true; // this maybe the same than lender!=null..
        request.lender = msg.sender;
        requests[idx] = request;
    }

    function pay(uint256 idx, uint256 amount) public onlyOwner {
        Request memory request = requests[idx];
        require(request.inProgress==true, "request not in progress");
        require(request.lender!=0x0000000000000000000000000000000000000000, "no lender to transfer to..");
        require(request.offeredAmount>=request.returnedAmount+amount, "amount excess");

        IERC20 Token = IERC20(request.offeredToken);
        Token.transfer(request.lender, amount);

        request.returnedAmount+=amount;
        locked[address(Token)]-=amount;
        //verify if it is completely done..
        if (request.returnedAmount==request.offeredAmount) {
            request.inProgress=false;
            request.completed=true;
        }
        requests[idx] = request;
    }

    function execute(address target, bytes memory xdata) public onlyOwner returns (bytes memory) {
        (bool success, bytes memory ret) = target.call(xdata);
        if (success) {
            verify();
        } // verify the not success case..
        return ret;
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

    function verify() internal {
        for(uint256 idx=0;idx<tokens.length;idx++) {
            IERC20 Token = IERC20(tokens[idx]);
            if (Token.balanceOf(address(this))<locked[address(Token)]) {
                revert("transaction used locked collateral!");
            }
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}
