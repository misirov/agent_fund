import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUsers = async () => {
  const response = await api.get('/users/');
  return response.data;
};

export const getChannels = async () => {
  const response = await api.get('/channels/');
  return response.data;
};

export const getMessages = async (limit = 100) => {
  const response = await api.get(`/messages/?limit=${limit}`);
  return response.data;
};

export const getProtocols = async () => {
  const response = await api.get('/protocols/');
  return response.data;
};

export const getProtocolSentiment = async (protocolName) => {
  const response = await api.get(`/protocols/${protocolName}/sentiment`);
  return response.data;
};

export default api; 