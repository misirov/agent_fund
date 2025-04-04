// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Fund} from "../src/Fund.sol";

contract FundScript is Script {
    Fund public fund;
    address fund_manager = makeAddr("fund_manager");


    function setUp() public {  }

    function run() public {
        vm.startBroadcast();

        fund = new Fund(fund_manager);

        vm.stopBroadcast();
    }
}
