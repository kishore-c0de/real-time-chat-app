// This file contains the logic for creating rooms, joining rooms,
// listing rooms, and fetching old messages of a room.

const db = require("../config/db");

// CREATE a new chat room
async function createRoom(req, res) {
  try {
    const { name } = req.body;
    const userId = req.user.id; // comes from the JWT (authMiddleware)

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    // Check if room already exists
    const [existingRooms] = await db.query(
      "SELECT * FROM rooms WHERE name = ?",
      [name]
    );

    if (existingRooms.length > 0) {
      return res.status(400).json({ message: "Room already exists" });
    }

    // Create the room
    const [result] = await db.query(
      "INSERT INTO rooms (name, created_by) VALUES (?, ?)",
      [name, userId]
    );

    const roomId = result.insertId;

    // Automatically add the creator as a member of the room
    await db.query(
      "INSERT INTO room_members (room_id, user_id) VALUES (?, ?)",
      [roomId, userId]
    );

    res.status(201).json({ message: "Room created", roomId, name });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// GET all available rooms
async function getRooms(req, res) {
  try {
    const [rooms] = await db.query("SELECT * FROM rooms ORDER BY created_at DESC");
    res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// JOIN a room (adds the user as a member if not already one)
async function joinRoom(req, res) {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Check if the room exists
    const [rooms] = await db.query("SELECT * FROM rooms WHERE id = ?", [roomId]);
    if (rooms.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if the user is already a member
    const [members] = await db.query(
      "SELECT * FROM room_members WHERE room_id = ? AND user_id = ?",
      [roomId, userId]
    );

    if (members.length === 0) {
      // Not a member yet, so add them
      await db.query(
        "INSERT INTO room_members (room_id, user_id) VALUES (?, ?)",
        [roomId, userId]
      );
    }

    res.json({ message: "Joined room successfully", room: rooms[0] });
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

// GET old messages of a room (so new users see chat history)
async function getRoomMessages(req, res) {
  try {
    const { roomId } = req.params;

    const [messages] = await db.query(
      `SELECT messages.id, messages.message, messages.created_at, users.username
       FROM messages
       JOIN users ON messages.user_id = users.id
       WHERE messages.room_id = ?
       ORDER BY messages.created_at ASC`,
      [roomId]
    );

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { createRoom, getRooms, joinRoom, getRoomMessages };
