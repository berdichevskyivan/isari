import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import HomePage from './pages/HomePage';
import WorkersPage from './pages/WorkersPage'
import LearningPage from './pages/LearningPage';
import WorkPage from './pages/WorkPage';
// import LorenzPage from './pages/LorenzPage';
import CreateWorkerPage from './pages/CreateWorkerPage';
import WorkerDashboardPage from './pages/WorkerDashboardPage';
import { socket, python_socket } from './socket';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

const isProduction = import.meta.env.NODE_ENV === 'production';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isPythonSocketConnected, setIsPythonSocketConnected] = useState(python_socket.connected)
  const [workers, setWorkers] = useState([]);
  const [workerOptions, setWorkerOptions] = useState(null);

  const [TSNEData, setTSNEData] = useState([]);
  const [predictedTokens, setPredictedTokens] = useState([])

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onPythonSocketConnect() {
      setIsPythonSocketConnected(true);
    }

    function onPythonSocketDisconnect() {
      setIsPythonSocketConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    socket.on('updateWorkers', (data) => {
      // console.log('updateWorkers called: ', data);
      setWorkers(data);
    })

    python_socket.on('updateTSNEData', (data) => {
      console.log('updateTSNEData called: ', data);
      setTSNEData(data);
    })

    python_socket.on('updatePredictedTokensData', (data) => {
      console.log('updatePredictedTokensData called: ', data);
      setPredictedTokens(data);
    })

    python_socket.on('connect', onPythonSocketConnect);
    python_socket.on('disconnect', onPythonSocketDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      python_socket.off('connect', onPythonSocketConnect);
      python_socket.off('disconnect', onPythonSocketDisconnect);
    };
  }, []);

  useEffect(() => {
    async function fetchWorkerOptions() {
      try {
        const response = await axios.get(isProduction ? '/fetchWorkerOptions' : 'http://localhost/fetchWorkerOptions');
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
    <NotificationProvider>
      <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/workers" element={<WorkersPage workers={workers} workerOptions={workerOptions} setWorkers={setWorkers}/>} />
              <Route path="/learning" element={<LearningPage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/create-worker" element={<CreateWorkerPage workerOptions={workerOptions} />} />
              <Route path="/worker-dashboard" element={<WorkerDashboardPage workerOptions={workerOptions} />} />
              {/* <Route path="/lorenz" element={<LorenzPage TSNEData={TSNEData} setTSNEData={setTSNEData} predictedTokens={predictedTokens} setPredictedTokens={setPredictedTokens} />} /> */}
            </Routes>
          </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
