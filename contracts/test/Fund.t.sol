// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Fund} from "../src/Fund.sol";

contract FundTest is Test {
    Fund public fund;
    address owner = makeAddr("fund owner");


    function setUp() public {
        fund = new Fund(owner);
    }


    function test_deposit() public {
        uint total = fund.totalSupply();
    }





}


