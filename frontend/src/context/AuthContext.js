import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// --- CRITICAL ADDITION: Define the Base URL ---
const API_BASE_URL = process.env.REACT_APP_API_URL;
// ---------------------------------------------

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('garage_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Secure login logic using backend verification
  const login = async (username, password) => {
    try {
      // --- AFFECTED PART: Updated API URL for POST ---
      const response = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
      // --------------------------------------------

      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('garage_user', JSON.stringify(userData));
    } catch (error) {
      // Log the error for better debugging (optional, but helpful)
      console.error("Login attempt failed:", error.response ? error.response.data : error.message);
      throw new Error('Invalid credentials');
    }
  };

  // Log out and clear user session
  const logout = () => {
    setUser(null);
    localStorage.removeItem('garage_user');
  };

  // Provide user state and auth actions
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);