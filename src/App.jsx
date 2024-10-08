import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import HomePage from './pages/HomePage';
import WorkersPage from './pages/WorkersPage'
import CreateWorkerPage from './pages/CreateWorkerPage';
import WorkerDashboardPage from './pages/WorkerDashboard/WorkerDashboardPage';
import { socket } from './socket';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import TaskViewerPage from './pages/TaskViewerPage';
import IssueViewerPage from './pages/IssueViewerPage';
import SubmitIssuePage from './pages/SubmitIssuePage';

const isProduction = import.meta.env.MODE === 'production';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [workers, setWorkers] = useState([]);
  const [workerOptions, setWorkerOptions] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);

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
      setWorkers(data);
    })

    socket.on('updateTasks', (data) => {
      localStorage.setItem('tasks', JSON.stringify(data));
      setTasks(data);
    })

    socket.on('updateIssues', (data) => {
      localStorage.setItem('issues', JSON.stringify(data));
      setIssues(data);
    })

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
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
            setWorkerOptions(fetchedData);
            localStorage.setItem('workerOptions', JSON.stringify(fetchedData));
          } else {
            setWorkerOptions(parsedStoredWorkerOptions);
          }
        } else {
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
              <Route path="/task-viewer" element={<TaskViewerPage tasks={tasks} />} />
              <Route path="/issue-viewer" element={<IssueViewerPage issues={issues} />} />
              <Route path="/submit-issue" element={<SubmitIssuePage />} />
              <Route path="/workers" element={<WorkersPage workers={workers} workerOptions={workerOptions} setWorkers={setWorkers}/>} />
              <Route path="/create-worker" element={<CreateWorkerPage workerOptions={workerOptions} />} />
              <Route path="/worker-dashboard" element={<WorkerDashboardPage workerOptions={workerOptions} />} />
            </Routes>
          </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
