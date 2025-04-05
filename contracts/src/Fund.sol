// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


contract Fund {
    event tokenWhitelisted(address);
    event sharesMinted(address, uint256);
    event withdrawnShares(address, uint256);

    address public owner;
    uint256 public totalShares;
    uint256 public allocatedToken;
    uint256 public totalSupply;
    address public immutable token = 0x471EcE3750Da237f93B8E339c536989b8978a438;

    mapping(address user => uint256 shares) public userShares;
    

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _owner){
        owner = _owner;
    }


    function mintShares(uint256 _amount) public {
        userShares[msg.sender] += _amount;
        totalSupply += _amount;
        emit sharesMinted(msg.sender, _amount);
    }


    function withdrawShares(uint256 _amount) external {
        require(userShares[msg.sender] >= _amount, "not enough shares");
        userShares[msg.sender] -= _amount;
        totalSupply -= _amount;
        emit withdrawnShares(msg.sender, _amount);
    }


    function allocateToken(address _to, uint256 _amount) external onlyOwner {
        IERC20(token).transfer(_to, _amount);
        allocatedToken += _amount;
    }

 
    function getShares(address _user) public view returns (uint256) {
        return userShares[_user];
    }



}
