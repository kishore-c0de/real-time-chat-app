// This file handles all real-time (Socket.io) events:
// - user connects/disconnects
// - user joins a chat room
// - user sends a message (we save it to MySQL and broadcast it)
// - showing which users are online in a room

const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

// We keep a simple in-memory map of who is online in which room.
// Structure: { roomId: { socketId: username } }
const onlineUsersByRoom = {};

function initializeSocket(io) {
  // Middleware: check the JWT token before allowing a socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: no token"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: invalid token"));
      }
      socket.user = decoded; // { id, username }
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.username}`);

    // Event: user wants to join a specific chat room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId); // Socket.io's built-in room feature
      socket.currentRoom = roomId;

      if (!onlineUsersByRoom[roomId]) {
        onlineUsersByRoom[roomId] = {};
      }
      onlineUsersByRoom[roomId][socket.id] = socket.user.username;

      // Let everyone in the room know the updated online users list
      io.to(roomId).emit(
        "onlineUsers",
        Object.values(onlineUsersByRoom[roomId])
      );

      // Optional: tell the room someone joined
      socket.to(roomId).emit("systemMessage", `${socket.user.username} joined the room`);
    });

    // Event: user sends a new chat message
    socket.on("sendMessage", async ({ roomId, message }) => {
      try {
        // Save the message in MySQL so it persists
        const [result] = await db.query(
          "INSERT INTO messages (room_id, user_id, message) VALUES (?, ?, ?)",
          [roomId, socket.user.id, message]
        );

        const newMessage = {
          id: result.insertId,
          message,
          username: socket.user.username,
          created_at: new Date(),
        };

        // Broadcast the message to everyone in the room (including sender)
        io.to(roomId).emit("receiveMessage", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Event: user disconnects (closes tab, loses connection, etc.)
    socket.on("disconnect", () => {
      const roomId = socket.currentRoom;

      if (roomId && onlineUsersByRoom[roomId]) {
        delete onlineUsersByRoom[roomId][socket.id];

        // Update everyone in the room about who is still online
        io.to(roomId).emit(
          "onlineUsers",
          Object.values(onlineUsersByRoom[roomId])
        );

        socket.to(roomId).emit("systemMessage", `${socket.user.username} left the room`);
      }

      console.log(`Socket disconnected: ${socket.user.username}`);
    });
  });
}

module.exports = initializeSocket;
