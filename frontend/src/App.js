import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Protocols from './pages/Protocols';
import Users from './pages/Users';
import Messages from './pages/Messages';
import Fund from './pages/Fund';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/protocols" element={<Protocols />} />
        <Route path="/users" element={<Users />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/fund" element={<Fund />} />
      </Routes>
    </Layout>
  );
}

export default App; 