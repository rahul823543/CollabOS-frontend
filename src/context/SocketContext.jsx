import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      const newSocket = io('http://localhost:5000', {
        query: { userId: user._id }
      });

      // Authenticate with the backend using JWT token
      newSocket.on('connect', () => {
        newSocket.emit('authenticate', { token });
      });

      newSocket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data.name);
      });

      newSocket.on('auth-error', (err) => {
        console.error('Socket auth error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.off('connect');
        newSocket.off('authenticated');
        newSocket.off('auth-error');
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
