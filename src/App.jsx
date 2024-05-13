import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import CreateWorkerPage from './pages/CreateWorkerPage';
import WorkerDashboardPage from './pages/WorkerDashboardPage';
import { socket } from './socket';

// The events listeners are then registered in the App component,
// which stores the state and pass it down to its child components via props.

function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    // socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // socket.off('foo', onFooEvent);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/create-worker" element={<CreateWorkerPage />} />
        <Route path="/worker-dashboard" element={<WorkerDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
