// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Fund} from "../src/Fund.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";

contract FundScript is Script {
    Fund public fund;
    address fund_manager = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
    

    function setUp() public {  }

    function run() public {
        vm.startBroadcast();

        MockERC20 usd = new MockERC20("DOLLAR", "USD", 10e6);
        
        fund = new Fund(fund_manager, address(usd));

        vm.stopBroadcast();
    }
}
