import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Session check failed. Token may be expired:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      // Sending request to backend
      const res = await api.post('/auth/login', { email, password });
      
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      
    } catch (error) {
      console.error("Login Request Failed! Details:", error.response || error);
      throw error; // Re-throw so Login.js can show the error message in the UI
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);

    } catch (error) {
      console.error("Registration Request Failed! Details:", error.response || error);
      throw error; 
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
