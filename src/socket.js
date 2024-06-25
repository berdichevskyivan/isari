import { io } from 'socket.io-client';

const isProduction = import.meta.env.MODE === 'production';

const socketUrl = isProduction ? 'wss://isari.ai' : 'http://localhost';
const pythonSocketUrl = isProduction ? 'wss://isari.ai:3001' : 'http://localhost:3001';

export const socket = io(socketUrl, {
    withCredentials: false,
    transports: ['websocket']
});

export const python_socket = io(pythonSocketUrl, {
    withCredentials: false,
    transports: ['websocket']
});