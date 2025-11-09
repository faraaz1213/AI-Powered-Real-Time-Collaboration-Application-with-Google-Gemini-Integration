import { io } from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('❌ No token found in localStorage');
    return;
  }

  socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
    auth: { token },
    query: { projectId },
  });

  socketInstance.on('connect', () => {
    console.log('✅ Connected to Socket.IO Server');
  });

  socketInstance.on('connect_error', (err) => {
    console.error('❌ Connection Error:', err.message);
  });

  return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
  if (!socketInstance) return console.error('❌ Socket not initialized');
  socketInstance.on(eventName, cb);
};

export const sendMessage = (eventName, data) => {
  if (!socketInstance) return console.error('❌ Socket not initialized');
  socketInstance.emit(eventName, data);
};


