// Routes related to chat rooms
// All these routes are protected — user must send a valid JWT token

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  createRoom,
  getRooms,
  joinRoom,
  getRoomMessages,
} = require("../controllers/roomController");

router.post("/", verifyToken, createRoom);
router.get("/", verifyToken, getRooms);
router.post("/:roomId/join", verifyToken, joinRoom);
router.get("/:roomId/messages", verifyToken, getRoomMessages);

module.exports = router;
