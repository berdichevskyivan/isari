import { io } from 'socket.io-client';

// Re-check withCredentials option passed
export const socket = io('http://localhost:3000', {
    withCredentials: false,
    transports: ['websocket'] // Ensure using the correct transport
});

// export const socket = io(URL, {
//     autoConnect: false
// });