// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@acala-network/contracts/dex/IDEX.sol";
import "@acala-network/contracts/oracle/IOracle.sol";
import "@acala-network/contracts/utils/Predeploy.sol";
import "@acala-network/contracts/utils/AcalaTokens.sol";

contract Trader {
    constructor() payable {}

    function trade(
        address tokenA,
        address tokenB,
        uint amount
    ) external returns (bool) {
        address[] memory path = new address[](2);
        path[0] = tokenA;
        path[1] = tokenB;
        return IDEX(DEX).swapWithExactSupply(path, amount, 0);
    }
}
