/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      socketInstance.emit("authenticate", { token });
    });

    socketInstance.on("online-users", (users) => {
      setOnlineUsers(
        Array.isArray(users)
          ? users.map((u) => String(u.userId))
          : []
      );
    });

    socketInstance.on("user-online", ({ userId }) => {
      setOnlineUsers((prev) =>
        prev.includes(String(userId))
          ? prev
          : [...prev, String(userId)]
      );
    });

    socketInstance.on("user-offline", ({ userId }) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => id !== String(userId))
      );
    });

    socketInstance.on("auth-error", (err) => {
      console.error("Socket auth failed:", err);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      onlineUsers,
      isUserOnline: (userId) =>
        onlineUsers.includes(String(userId)),
    }),
    [onlineUsers]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};