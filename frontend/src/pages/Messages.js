import React, { useState, useEffect } from 'react';
import { getMessages, getUsers, getChannels } from '../api/api';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [channels, setChannels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch messages, users, and channels
        const messagesData = await getMessages(100);
        const usersData = await getUsers();
        const channelsData = await getChannels();
        
        // Create lookup maps for users and channels
        const usersMap = {};
        usersData.forEach(user => {
          usersMap[user.id] = user;
        });
        
        const channelsMap = {};
        channelsData.forEach(channel => {
          channelsMap[channel.id] = channel;
        });
        
        setMessages(messagesData);
        setUsers(usersMap);
        setChannels(channelsMap);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getSentimentColor = (sentiment) => {
    if (!sentiment && sentiment !== 0) return 'bg-gray-200';
    if (sentiment > 0.5) return 'bg-green-500';
    if (sentiment > 0) return 'bg-green-300';
    if (sentiment === 0) return 'bg-yellow-300';
    if (sentiment > -0.5) return 'bg-red-300';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-celo-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
      
      {messages.length === 0 ? (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            No messages found.
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {messages.map((message) => {
              const user = users[message.user_id] || { username: 'Unknown User' };
              const channel = channels[message.channel_id] || { name: 'Unknown Channel' };
              
              return (
                <li key={message.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getSentimentColor(message.sentiment_score)} flex items-center justify-center`}>
                          <span className="text-white font-medium">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-celo-dark">{user.username}</div>
                          <div className="text-sm text-gray-500">
                            #{channel.name} | {new Date(message.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {message.protocol_name && (
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {message.protocol_name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-900">{message.content}</p>
                    </div>
                    
                    {message.sentiment_score !== null && (
                      <div className="mt-2 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Sentiment:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          message.sentiment_score > 0.2 ? 'bg-green-100 text-green-800' : 
                          message.sentiment_score < -0.2 ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.sentiment_score > 0.2 ? 'Positive' : 
                           message.sentiment_score < -0.2 ? 'Negative' : 
                           'Neutral'} ({message.sentiment_score.toFixed(2)})
                        </span>
                      </div>
                    )}
                    
                    {message.risk_assessment && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Risk: {message.risk_assessment}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 