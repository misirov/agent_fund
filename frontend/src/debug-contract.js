const { ethers } = require('ethers');
const fundAbi = require('./fund_abi.json');

// Contract details
const FUND_ADDRESS = "0xA15BB66138824a1c7167f5E85b957d04Dd34E468";
const RPC_URL = "http://127.0.0.1:8545";

async function debugContract() {
  console.log('Starting contract debug...');
  
  try {
    // Connect to the provider
    console.log('Connecting to provider:', RPC_URL);
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Get network information
    const network = await provider.getNetwork();
    console.log('Connected to network:', network);
    
    // Get the latest block number
    const blockNumber = await provider.getBlockNumber();
    console.log('Current block number:', blockNumber);
    
    // Check if contract exists
    console.log('Checking contract at address:', FUND_ADDRESS);
    const code = await provider.getCode(FUND_ADDRESS);
    if (code === '0x') {
      console.error('No contract found at the specified address');
      return;
    }
    console.log('Contract exists at the specified address');
    
    // Create contract instance
    console.log('Creating contract instance...');
    const fundContract = new ethers.Contract(FUND_ADDRESS, fundAbi, provider);
    
    // Call contract functions
    console.log('Calling contract functions...');
    
    try {
      const totalSupply = await fundContract.totalSupply();
      console.log('Total Supply:', ethers.utils.formatEther(totalSupply));
    } catch (error) {
      console.error('Error calling totalSupply():', error.message);
    }
    
    try {
      const totalShares = await fundContract.totalShares();
      console.log('Total Shares:', ethers.utils.formatEther(totalShares));
    } catch (error) {
      console.error('Error calling totalShares():', error.message);
    }
    
    try {
      const owner = await fundContract.owner();
      console.log('Owner:', owner);
    } catch (error) {
      console.error('Error calling owner():', error.message);
    }
    
    try {
      const token = await fundContract.token();
      console.log('Token Address:', token);
    } catch (error) {
      console.error('Error calling token():', error.message);
    }
    
    // Try to get events
    console.log('Fetching events...');
    
    try {
      // Get deposit events
      const depositFilter = fundContract.filters.sharesMinted();
      const depositEvents = await fundContract.queryFilter(depositFilter, -1000);
      console.log('Found', depositEvents.length, 'deposit events');
      
      if (depositEvents.length > 0) {
        console.log('Sample deposit event:', {
          user: depositEvents[0].args[0],
          amount: ethers.utils.formatEther(depositEvents[0].args[1]),
          blockNumber: depositEvents[0].blockNumber,
          transactionHash: depositEvents[0].transactionHash
        });
      }
    } catch (error) {
      console.error('Error getting deposit events:', error.message);
    }
    
    try {
      // Get withdrawal events
      const withdrawFilter = fundContract.filters.withdrawnShares();
      const withdrawEvents = await fundContract.queryFilter(withdrawFilter, -1000);
      console.log('Found', withdrawEvents.length, 'withdrawal events');
      
      if (withdrawEvents.length > 0) {
        console.log('Sample withdrawal event:', {
          user: withdrawEvents[0].args[0],
          amount: ethers.utils.formatEther(withdrawEvents[0].args[1]),
          blockNumber: withdrawEvents[0].blockNumber,
          transactionHash: withdrawEvents[0].transactionHash
        });
      }
    } catch (error) {
      console.error('Error getting withdrawal events:', error.message);
    }
    
    // Try to get logs directly
    console.log('Fetching logs directly...');
    
    try {
      const filter = {
        address: FUND_ADDRESS,
        fromBlock: blockNumber - 1000,
        toBlock: 'latest'
      };
      
      const logs = await provider.getLogs(filter);
      console.log('Found', logs.length, 'logs');
      
      if (logs.length > 0) {
        console.log('Sample log:', logs[0]);
      }
    } catch (error) {
      console.error('Error getting logs:', error.message);
    }
    
    console.log('Contract debug completed');
  } catch (error) {
    console.error('Error in debug process:', error);
  }
}

// Run the debug function
debugContract().then(() => console.log('Debug script finished'));

module.exports = debugContract; 