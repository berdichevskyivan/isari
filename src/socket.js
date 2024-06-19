import { io } from 'socket.io-client';

// Re-check withCredentials option passed
export const socket = io('wss://isari.ai', {
    withCredentials: false,
    transports: ['websocket'] // Ensure using the correct transport
});

export const python_socket = io('wss://isari.ai:3001', {
    withCredentials: false,
    transports: ['websocket'] // Ensure using the correct transport
});

// export const socket = io(URL, {
//     autoConnect: false
// });