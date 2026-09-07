// This file creates one Socket.io connection that our chat page can use.
// We create the connection only when needed (see ChatRoom.jsx),
// passing the JWT token so the backend knows who we are.

import { io } from "socket.io-client";

export function createSocketConnection(token) {
  const socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
      token: token,
    },
  });

  return socket;
}
