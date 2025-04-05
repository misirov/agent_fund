import React, { useState, useEffect } from 'react';
import { getFundData, getTransactionHistory, FUND_ADDRESS } from '../api/web3';
import { Chart as ChartJS, Tooltip, Legend } from 'chart.js';

ChartJS.register(Tooltip, Legend);

export default function Fund() {
  const [fundData, setFundData] = useState({
    totalSupply: '0',
  });
  
  const [transactions, setTransactions] = useState([]);
  const [transactionError, setTransactionError] = useState(null);
  const [fundLoading, setFundLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Separate function to fetch fund data
    const fetchFundData = async () => {
      try {
        setFundLoading(true);
        
        // Get fund data
        const data = await getFundData();
        setFundData(data);
        
        console.log('Fund data:', data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load fund data. Please try again later.');
      } finally {
        setFundLoading(false);
      }
    };
    
    // Separate function to fetch transaction history
    const fetchTransactionHistory = async () => {
      try {
        setTxLoading(true);
        const history = await getTransactionHistory();
        setTransactions(history);
        console.log('Transaction history:', history);
        setTransactionError(null);
      } catch (txError) {
        console.error('Error fetching transaction history:', txError);
        setTransactionError('Could not load transaction history. The contract may not have any events yet.');
      } finally {
        setTxLoading(false);
      }
    };
    
    // Execute both fetches independently
    fetchFundData();
    fetchTransactionHistory();
  }, []);
  
  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <p className="mt-2">
          <button 
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </p>
      </div>
    );
  }
  
  // Helper function to format addresses
  const formatAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Fund Details</h1>
      
      <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
        <p className="font-bold">Contract Address</p>
        <p className="break-all">{FUND_ADDRESS}</p>
      </div>
      
      {/* Fund Stats */}
      <div className="mt-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Fund Stats</h3>
        
        {fundLoading ? (
          <div className="mt-4 flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Supply</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {fundData.totalSupply} CELO
                  <div className="text-xs text-gray-500 mt-1">
                    Raw value: {fundData.totalSupply}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Transaction Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {transactions.length > 0 && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{transactions.length}</dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Deposits</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {transactions.filter(tx => tx.type === 'deposit').length}
                </dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Withdrawals</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {transactions.filter(tx => tx.type === 'withdrawal').length}
                </dd>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Transaction History */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Transactions</h3>
        
        {txLoading ? (
          <div className="mt-4 flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-500">Loading transactions...</span>
          </div>
        ) : transactionError ? (
          <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Warning</p>
            <p>{transactionError}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
              No transactions found. This could be because the contract is new or doesn't have the expected events.
            </div>
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {transactions.slice(0, 10).map((tx, index) => (
                <li key={index}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
                          <span className={`text-${tx.type === 'deposit' ? 'green' : 'red'}-600 font-medium`}>
                            {tx.type === 'deposit' ? '+' : '-'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatAddress(tx.user)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <div className="text-sm text-gray-900 font-medium">
                          {tx.amount} CELO
                        </div>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {tx.timestamp instanceof Date ? 
                            tx.timestamp.toLocaleString() : 
                            'Unknown date'}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <a 
                          href={`https://explorer.celo.org/alfajores/tx/${tx.transactionHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 