// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title KlanOath — on-chain record of a member's clan oath for klan.social
/// @notice Deploy to Robinhood Chain (chain id 4663) or its testnet (46630).
///         clanId is keccak256(clan slug) computed by the app.
contract KlanOath {
    struct Oath {
        bytes32 clanId;
        uint64 swornAt;
    }

    mapping(address => Oath) private _oaths;

    event OathSworn(address indexed member, bytes32 indexed clanId, uint64 swornAt);
    event OathRenounced(address indexed member);

    /// @notice Swear the oath to a clan (overwrites a previous oath).
    function swear(bytes32 clanId) external {
        require(clanId != bytes32(0), "clanId required");
        _oaths[msg.sender] = Oath(clanId, uint64(block.timestamp));
        emit OathSworn(msg.sender, clanId, uint64(block.timestamp));
    }

    /// @notice Leave the clan (clear the oath).
    function renounce() external {
        delete _oaths[msg.sender];
        emit OathRenounced(msg.sender);
    }

    /// @notice Read a member's oath. clanId == 0 means no oath.
    function oathOf(address member) external view returns (bytes32 clanId, uint64 swornAt) {
        Oath storage o = _oaths[member];
        return (o.clanId, o.swornAt);
    }
}
