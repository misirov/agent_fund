import React, { useState, useEffect } from 'react';
import { getProtocols, getProtocolSentiment } from '../api/api';

export default function Protocols() {
  const [protocols, setProtocols] = useState([]);
  const [protocolDetails, setProtocolDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        setLoading(true);
        const data = await getProtocols();
        setProtocols(data);
        
        // Fetch details for each protocol
        const details = {};
        for (const protocol of data) {
          try {
            const sentiment = await getProtocolSentiment(protocol);
            details[protocol] = sentiment;
          } catch (err) {
            console.error(`Error fetching details for ${protocol}:`, err);
            details[protocol] = { error: 'Failed to load details' };
          }
        }
        
        setProtocolDetails(details);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching protocols:', err);
        setError('Failed to load protocols');
        setLoading(false);
      }
    };
    
    fetchProtocols();
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
      <h1 className="text-2xl font-semibold text-gray-900">Protocols</h1>
      
      {protocols.length === 0 ? (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            No protocols found. Start tracking protocols by analyzing messages.
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {protocols.map((protocol) => {
              const details = protocolDetails[protocol] || {};
              return (
                <li key={protocol}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getSentimentColor(details.average_sentiment)} flex items-center justify-center`}>
                          <span className="text-white font-medium">{protocol.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-celo-dark">{protocol}</div>
                          <div className="text-sm text-gray-500">
                            {details.message_count || 0} messages | Sentiment: {details.average_sentiment ? details.average_sentiment.toFixed(2) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${details.average_sentiment > 0 ? 'bg-green-100 text-green-800' : details.average_sentiment < 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {details.average_sentiment > 0.2 ? 'Positive' : details.average_sentiment < -0.2 ? 'Negative' : 'Neutral'}
                        </span>
                      </div>
                    </div>
                    
                    {details.latest_risk_assessment && (
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Risk Assessment: {details.latest_risk_assessment}
                          </div>
                        </div>
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