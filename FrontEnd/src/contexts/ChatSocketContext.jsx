import React, { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socketService';

const ChatSocketContext = createContext({ socket: null });

/**
 * Provides socket for chat (dashboard only). Connects when token exists, disconnects on unmount.
 */
export function ChatSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const s = connectSocket(token);
    setSocket(s ?? null);
    return () => {
      disconnectSocket();
      setSocket(null);
    };
  }, []);

  return (
    <ChatSocketContext.Provider value={{ socket }}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket() {
  return useContext(ChatSocketContext);
}

/**
 * Get socket (for use outside React or when provider might not be mounted).
 */
export function getChatSocket() {
  return getSocket();
}
