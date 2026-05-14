import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Session restore failed:', err);

        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);

      const res = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed';

      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);

      const res = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed';

      setError(message);
      throw err;
    }
  }, []);

  const googleLogin = useCallback(async (credential) => {
    try {
      setError(null);

      const res = await api.post('/auth/google', {
        credential,
      });

      const { token, ...userData } = res.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Google login failed';

      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) =>
      prev ? { ...prev, ...updates } : null
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        login,
        register,
        googleLogin,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};