// Centralization vs Decentralization
// a single DB    vs Distributed Ledger DB
// asingle BN     vs BN network
// Governance : 통치, 관리 -> vote, voting 블록체인에서는.
// A agenda --> by vote --> decision

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract ManagedAccess {
    address public owner;
    address public manager;

    constructor(address _owner, address _manager) {
        owner = _owner;
        manager = _manager;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "you are not authorized");
        _;
    }
    modifier onlyManager() {
        require(
            msg.sender == manager,
            "You are not authorized to manage this contract"
        );
        _;
    }
}
