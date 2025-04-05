// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Fund} from "../src/Fund.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract FundTest is Test {
    Fund public fund;
    MockERC20 public usd;
    address owner = makeAddr("fund owner");

    function setUp() public {
        usd = new MockERC20("DOLLAR", "USD", 10e6);
        vm.prank(owner);
        fund = new Fund(owner, address(usd));
    }

    
    function test_deposit() public {
        address user1 = makeAddr("user1");
        address user2 = makeAddr("user2");
        address user3 = makeAddr("user3");
        
        usd.mint(user1, 1_000);
        usd.mint(user2, 2_000);
        usd.mint(user3, 3_000);
        
        // User 1 deposits
        vm.startPrank(user1);
        usd.approve(address(fund), 1_000);
        fund.deposit(1_000);
        vm.stopPrank();
        
        // User 2 deposits
        vm.startPrank(user2);
        usd.approve(address(fund), 2_000);
        fund.deposit(2_000);
        vm.stopPrank();
        
        // User 3 deposits
        vm.startPrank(user3);
        usd.approve(address(fund), 3_000);
        fund.deposit(3_000);
        vm.stopPrank();
        
        // Verify all deposits were processed correctly
        assertEq(fund.getShares(user1), 1_000);
        assertEq(fund.getShares(user2), 2_000);
        assertEq(fund.getShares(user3), 3_000);
        assertEq(usd.balanceOf(address(fund)), 6_000);
    }

    function test_withdraw() public {
        // Setup - deposit first
        address user1 = makeAddr("user1");
        usd.mint(user1, 1_000);
        
        vm.startPrank(user1);
        usd.approve(address(fund), 1_000);
        fund.deposit(1_000);
        
        // Verify initial state
        assertEq(fund.getShares(user1), 1_000);
        assertEq(usd.balanceOf(address(fund)), 1_000);
        assertEq(usd.balanceOf(user1), 0);
        
        // Withdraw half the funds
        fund.withdraw(500);
        
        // Verify partial withdrawal
        assertEq(fund.getShares(user1), 500);
        assertEq(usd.balanceOf(address(fund)), 500);
        assertEq(usd.balanceOf(user1), 500);
        
        // Withdraw remaining funds
        fund.withdraw(500);
        
        // Verify complete withdrawal
        assertEq(fund.getShares(user1), 0);
        assertEq(usd.balanceOf(address(fund)), 0);
        assertEq(usd.balanceOf(user1), 1_000);
        
        vm.stopPrank();
    }





}


