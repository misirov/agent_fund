import React, { useState, useEffect } from 'react';
import { getUsers, getMessages, getProtocols } from '../api/api';
import { getFundData } from '../api/web3';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    messageCount: 0,
    protocolCount: 0,
    totalSupply: '0',
  });
  
  const [sentimentData, setSentimentData] = useState({
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        label: 'Sentiment Distribution',
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(53, 208, 127, 0.6)',
          'rgba(251, 204, 92, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(53, 208, 127, 1)',
          'rgba(251, 204, 92, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  });
  
  const [messageActivity, setMessageActivity] = useState({
    labels: [],
    datasets: [
      {
        label: 'Messages per Day',
        data: [],
        borderColor: 'rgba(53, 208, 127, 1)',
        backgroundColor: 'rgba(53, 208, 127, 0.2)',
        tension: 0.4,
      },
    ],
  });
  
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Initialize with default values
        let users = [];
        let messages = [];
        let protocols = [];
        let fundData = { totalSupply: '0' };
        
        // Fetch basic stats
        try {
          users = await getUsers();
          messages = await getMessages();
          protocols = await getProtocols();
        } catch (error) {
          console.error('Error fetching API data:', error);
          setApiError(true);
        }
        
        // Fetch fund data
        try {
          fundData = await getFundData();
        } catch (error) {
          console.error('Error fetching blockchain data:', error);
        }
        
        setStats({
          userCount: users.length,
          messageCount: messages.length,
          protocolCount: protocols.length,
          totalSupply: fundData.totalSupply,
        });
        
        if (messages.length > 0) {
          // Calculate sentiment distribution
          const positive = messages.filter(m => m.sentiment_score > 0.2).length;
          const negative = messages.filter(m => m.sentiment_score < -0.2).length;
          const neutral = messages.length - positive - negative;
          
          setSentimentData(prevData => ({
            ...prevData,
            datasets: [
              {
                ...prevData.datasets[0],
                data: [positive, neutral, negative],
              },
            ],
          }));
          
          // Calculate message activity by day
          const messageDates = messages.map(m => {
            const date = new Date(m.created_at);
            return date.toISOString().split('T')[0];
          });
          
          // Count messages per day
          const messageCounts = {};
          messageDates.forEach(date => {
            messageCounts[date] = (messageCounts[date] || 0) + 1;
          });
          
          // Sort dates
          const sortedDates = Object.keys(messageCounts).sort();
          
          setMessageActivity(prevData => ({
            labels: sortedDates,
            datasets: [
              {
                ...prevData.datasets[0],
                data: sortedDates.map(date => messageCounts[date]),
              },
            ],
          }));
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {apiError && (
        <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">API Connection Issue</p>
          <p>Could not connect to the API. Some data may not be available.</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-celo-green"></div>
        </div>
      ) : (
      <>
      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-celo-green rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.userCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-celo-gold rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Messages</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.messageCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-celo-dark rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Protocols Tracked</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.protocolCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Fund Value</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalSupply} USD</dd>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      {!apiError && (
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Sentiment Distribution</h3>
            <div className="mt-5 h-64">
              <Pie data={sentimentData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Message Activity</h3>
            <div className="mt-5 h-64">
              <Line 
                data={messageActivity} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>
      )}
      </>
      )}
    </div>
  );
} 