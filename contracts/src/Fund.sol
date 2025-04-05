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
    event tokenWhitelisted(address indexed token);
    event sharesMinted(address indexed user, uint256 amount);
    event withdrawnShares(address indexed user, uint256 amount);

    address public owner;
    uint256 public totalShares;
    uint256 public allocatedToken;
    uint256 public totalSupply;
    address public token;

    mapping(address user => uint256 shares) public userShares;
    mapping(address token => bool whitelisted) public whitelistedTokens;
    

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _owner, address _token){
        owner = _owner;
        token = _token;
        whitelistToken(_token);
    }


    function deposit(uint256 _amount) public returns (bool) {
        require(_amount > 0, "no 0 amount");
        require(isWhitelisted(token), "Token not whitelisted");
        IERC20(token).transferFrom(msg.sender, address(this), _amount);        
        userShares[msg.sender] += _amount;
        totalSupply += _amount;
        totalShares += _amount;
        emit sharesMinted(msg.sender, _amount);
        return true;
    }


    function withdraw(uint256 _amount) external {
        require(userShares[msg.sender] >= _amount, "not enough shares");
        userShares[msg.sender] -= _amount;
        totalSupply -= _amount;
        totalShares -= _amount;
        IERC20(token).transfer(msg.sender, _amount);
        emit withdrawnShares(msg.sender, _amount);
    }


    function allocateToken(address _to, uint256 _amount) external onlyOwner {
        IERC20(token).transfer(_to, _amount);
        allocatedToken += _amount;
    }

 
    function getShares(address _user) public view returns (uint256) {
        return userShares[_user];
    }

    function whitelistToken(address _token) public onlyOwner {
        require(_token != address(0), "Invalid token address");
        whitelistedTokens[_token] = true;
        emit tokenWhitelisted(_token);
    }

    function isWhitelisted(address _token) public view returns (bool) {
        return whitelistedTokens[_token];
    }

}
