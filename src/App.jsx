import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import CreateWorkerNodePage from './pages/CreateWorkerNodePage';
import WorkerNodeDashboardPage from './pages/WorkerNodeDashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/create-worker-node" element={<CreateWorkerNodePage />} />
        <Route path="/worker-node-dashboard" element={<WorkerNodeDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
