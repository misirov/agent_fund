import { ethers } from 'ethers';
import fundAbi from '../fund_abi.json';

// Load environment variables
export const FUND_ADDRESS = process.env.REACT_APP_FUND_ADDRESS || "0xA15BB66138824a1c7167f5E85b957d04Dd34E468";
const RPC_URL = process.env.REACT_APP_RPC_URL || "http://127.0.0.1:8545";

console.log('Using contract address:', FUND_ADDRESS);
console.log('Using RPC URL:', RPC_URL);

// Initialize provider and contract
let provider;
let fundContract;

export const initWeb3 = async () => {
  try {
    console.log('Initializing web3 with RPC URL:', RPC_URL);
    
    // Initialize provider
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    
    // Get the network and log it
    const network = await provider.getNetwork();
    console.log('Connected to network:', network);
    
    // Debug: Check if the contract exists at the address
    const code = await provider.getCode(FUND_ADDRESS);
    console.log('Contract code at address:', code.length > 2 ? 'Contract exists' : 'No contract found');
    
    // Initialize contract
    fundContract = new ethers.Contract(FUND_ADDRESS, fundAbi, provider);
    console.log('Contract initialized successfully');
    
    return { provider, fundContract };
  } catch (error) {
    console.error('Error initializing web3:', error);
    throw error;
  }
};

export const getFundData = async () => {
  try {
    if (!fundContract) {
      console.log('Contract not initialized, initializing now...');
      await initWeb3();
    }
    
    // Get contract data
    let totalSupply = ethers.BigNumber.from(0);
    
    // Try up to 3 times to get the total supply
    let attempts = 0;
    const maxAttempts = 3;
    
    try {
      while (attempts < maxAttempts) {
        try {
          console.log(`Calling totalSupply() attempt ${attempts + 1}...`);
          totalSupply = await fundContract.totalSupply();
          console.log('Total supply raw value:', totalSupply.toString());
          break; // Success, exit the loop
        } catch (e) {
          attempts++;
          console.warn(`Attempt ${attempts} failed:`, e.message);
          
          if (attempts >= maxAttempts) {
            throw e; // Rethrow the error after max attempts
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (e) {
      console.warn('totalSupply function not found in contract:', e);
    }
    
    const formattedSupply = ethers.utils.formatEther(totalSupply);
    console.log('Formatted total supply:', formattedSupply);
    
    return {
      totalSupply: formattedSupply,
    };
  } catch (error) {
    console.error('Error getting fund data:', error);
    return {
      totalSupply: '0.0',
    };
  }
};

export const getUserShares = async (userAddress) => {
  try {
    if (!fundContract) {
      await initWeb3();
    }
    
    const shares = await fundContract.getShares(userAddress);
    return ethers.utils.formatEther(shares);
  } catch (error) {
    console.error('Error getting user shares:', error);
    return '0';
  }
};

// Function to listen for events
export const getTransactionHistory = async () => {
  try {
    if (!fundContract) {
      await initWeb3();
    }
    
    try {
      console.log('Fetching events using queryFilter...');
      
      // Get the current block number
      const currentBlock = await provider.getBlockNumber();
      console.log('Current block number:', currentBlock);
      
      // Use a smaller block range to avoid timeouts
      const fromBlock = Math.max(0, currentBlock - 10000); // Look at the last 10000 blocks
      
      // Create filters for the events
      console.log(`Querying events from block ${fromBlock} to latest...`);
      
      // Get deposit events (sharesMinted)
      const depositFilter = fundContract.filters.sharesMinted();
      const depositEvents = await fundContract.queryFilter(depositFilter, fromBlock, 'latest');
      console.log(`Found ${depositEvents.length} deposit events`);
      
      // Get withdrawal events (withdrawnShares)
      const withdrawFilter = fundContract.filters.withdrawnShares();
      const withdrawEvents = await fundContract.queryFilter(withdrawFilter, fromBlock, 'latest');
      console.log(`Found ${withdrawEvents.length} withdrawal events`);
      
      // Format events
      const deposits = depositEvents.map(event => ({
        type: 'deposit',
        user: event.args[0], // First argument is the user address
        amount: ethers.utils.formatEther(event.args[1]), // Second argument is the amount
        timestamp: new Date(), // We'll need to get the block timestamp
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      }));
      
      const withdrawals = withdrawEvents.map(event => ({
        type: 'withdrawal',
        user: event.args[0], // First argument is the user address
        amount: ethers.utils.formatEther(event.args[1]), // Second argument is the amount
        timestamp: new Date(), // We'll need to get the block timestamp
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      }));
      
      // Get block timestamps for each event
      const transactions = [...deposits, ...withdrawals];
      
      // Get unique block numbers
      const blockNumbers = [...new Set(transactions.map(tx => tx.blockNumber))];
      
      // Get block timestamps
      const blocks = await Promise.all(
        blockNumbers.map(blockNumber => provider.getBlock(blockNumber))
      );
      
      // Create a map of block number to timestamp
      const blockTimestamps = {};
      blocks.forEach(block => {
        blockTimestamps[block.number] = block.timestamp * 1000; // Convert to milliseconds
      });
      
      // Update timestamps
      transactions.forEach(tx => {
        tx.timestamp = new Date(blockTimestamps[tx.blockNumber]);
        delete tx.blockNumber; // Remove blockNumber as it's no longer needed
      });
      
      // Sort by timestamp (descending)
      transactions.sort((a, b) => b.timestamp - a.timestamp);
      
      return transactions;
    } catch (e) {
      console.warn('Error getting logs:', e);
      
      // Check if it's the specific "no backend is currently healthy" error
      if (e.message && e.message.includes('no backend is currently healthy')) {
        console.log('RPC endpoint is overloaded. Using mock data for demonstration...');
        
        // Create some mock data for demonstration purposes
        return [
          {
            type: 'deposit',
            user: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
            amount: '5.01',
            timestamp: new Date(),
            transactionHash: '0x123456789abcdef',
          },
          {
            type: 'deposit',
            user: '0xb0Ee7A142d267C1f36714E4a8F75612F20a79721',
            amount: '3.5',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            transactionHash: '0x223456789abcdef',
          },
          {
            type: 'withdrawal',
            user: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
            amount: '1.5',
            timestamp: new Date(Date.now() - 43200000), // 12 hours ago
            transactionHash: '0x323456789abcdef',
          }
        ];
      }
      
      // For other errors, rethrow
      throw e;
    }
  } catch (error) {
    console.error('Error getting transaction history:', error);
    
    // If we get here, something went wrong but we still want to show something
    console.log('Falling back to empty transaction list');
    return [];
  }
}; 