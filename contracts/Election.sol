// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;

    uint256 public candidatesCount;

    constructor() public {
        candidatesCount = 0;
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        addCandidate("Candidate 3");
        addCandidate("Candidate 4");
    }

    function addCandidate(string memory name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, name, 0);
    }

    function vote(uint256 id) public returns (uint256) {
        candidates[id].voteCount++;
        return candidates[id].voteCount;
    }
}
