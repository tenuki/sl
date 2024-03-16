// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Borrower} from "./Borrower.sol";

contract Factory {
    event Deploy(address NewContract);

    function create() public returns(address) {
        address owner = payable(msg.sender);
        Borrower _new = new Borrower(owner);
        emit Deploy(address(_new));
        return address(_new);
    }
}