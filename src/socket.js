import { io } from 'socket.io-client';

export const socket = io('http://localhost:3000', {
    withCredentials: false,
});

// export const socket = io(URL, {
//     autoConnect: false
// });