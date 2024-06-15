import React, { createContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const { openSnackbar } = useNotification();

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/verify-auth', { withCredentials: true });
      console.log('Auth status:', response.data.isAuthenticated);
      setIsLoggedIn(response.data.isAuthenticated);
      setLoggedInUser(response.data.user);
      return response.data.isAuthenticated;
    } catch (error) {
      console.error('Error checking auth status:', error);
      if (error.response && error.response.status === 401) {
        // Token expired or invalid, logout the user
        setIsLoggedIn(false);
        setLoggedInUser(null);
        await logout();
      }
      return false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3000/login', { email, password }, { withCredentials: true });
      if (response.data.message === 'Login successful') {
        console.log('Login successful');
        const checkAuthStatusResponse = await checkAuthStatus();
        if(checkAuthStatusResponse === true){
          setLoggedInUser(response.data.user);
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Login failed:', error.response.data.message);
      openSnackbar('Login failed.');
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post('http://localhost:3000/logout', {}, { withCredentials: true });
      if (response.data.message === 'Logout successful') {
        console.log('Logout successful');
        setIsLoggedIn(false);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error.response.data.message);
      openSnackbar('Logout failed.');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, loggedInUser, setLoggedInUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
