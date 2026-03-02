import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function getSocketUrl() {
  try {
    const url = new URL(API_BASE_URL);
    return url.origin;
  } catch {
    return window.location.origin;
  }
}

let socket = null;

/**
 * Connect to the chat Socket.io server. Uses token for auth.
 * @param {string} token - JWT from localStorage
 * @returns {import("socket.io-client").Socket | null}
 */
export function connectSocket(token) {
  if (!token) return null;
  if (socket?.connected) return socket;
  const url = getSocketUrl();
  socket = io(url, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  socket.on('connect_error', (err) => {
    console.warn('Chat socket connect_error:', err.message);
  });
  socket.on('auth_error', () => {
    socket?.disconnect();
  });
  return socket;
}

/**
 * Disconnect and clear socket.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get current socket instance (may be disconnected).
 */
export function getSocket() {
  return socket ?? null;
}
