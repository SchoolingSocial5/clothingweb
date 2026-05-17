import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Extract host without /api or /api/ suffix
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
