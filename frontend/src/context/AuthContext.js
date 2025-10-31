import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('garage_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Secure login logic using backend verification
  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/login', { username, password });

      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('garage_user', JSON.stringify(userData));
    } catch (error) {
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
