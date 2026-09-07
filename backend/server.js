// This is the main entry point of our backend server.
// It sets up Express (for REST APIs) and Socket.io (for real-time chat).

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const initializeSocket = require("./socket/socketHandler");

const app = express();

// Middleware
app.use(cors()); // allow requests from our React frontend
app.use(express.json()); // allow Express to read JSON from request body

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// Simple test route
app.get("/", (req, res) => {
  res.send("Chat app backend is running!");
});

// Create an HTTP server manually so Socket.io can attach to it
const server = http.createServer(app);

// Set up Socket.io on top of the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // allow any frontend to connect (fine for learning projects)
    methods: ["GET", "POST"],
  },
});

// Set up all our real-time chat events
initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
