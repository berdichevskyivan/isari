import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import LorenzPage from './pages/LorenzPage';
import CreateWorkerPage from './pages/CreateWorkerPage';
import WorkerDashboardPage from './pages/WorkerDashboardPage';
import { socket } from './socket';

// The events listeners are then registered in the App component,
// which stores the state and pass it down to its child components via props.

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [workers, setWorkers] = useState([]);
  const [workerOptions, setWorkerOptions] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('updateWorkers', (data) => {
      console.log('updateWorkers called: ', data);
      setWorkers(data);
    })

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    async function fetchWorkerOptions() {
      try {
        const response = await axios.get('http://localhost:3000/fetchWorkerOptions');
        const fetchedData = response.data;
        const storedWorkerOptions = localStorage.getItem('workerOptions');

        if (storedWorkerOptions) {
          const parsedStoredWorkerOptions = JSON.parse(storedWorkerOptions);

          // Compare fetched data with stored data
          if (JSON.stringify(fetchedData) !== JSON.stringify(parsedStoredWorkerOptions)) {
            console.log('Data has changed, updating localStorage and state.');
            setWorkerOptions(fetchedData);
            localStorage.setItem('workerOptions', JSON.stringify(fetchedData));
          } else {
            console.log('Data has not changed, using localStorage data.');
            setWorkerOptions(parsedStoredWorkerOptions);
          }
        } else {
          // No stored data, save the fetched data
          console.log('No localStorage data, saving fetched data.');
          setWorkerOptions(fetchedData);
          localStorage.setItem('workerOptions', JSON.stringify(fetchedData));
        }
      } catch (error) {
        console.error('Error fetching worker options:', error);
      }
    }

    fetchWorkerOptions();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage workers={workers} workerOptions={workerOptions} />} />
        <Route path="/lorenz" element={<LorenzPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/create-worker" element={<CreateWorkerPage workerOptions={workerOptions} />} />
        <Route path="/worker-dashboard" element={<WorkerDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
