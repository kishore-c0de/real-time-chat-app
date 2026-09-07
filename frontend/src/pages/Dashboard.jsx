import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Load the list of rooms when the page opens
  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      const response = await api.get("/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault();

    if (!newRoomName.trim()) return;

    try {
      await api.post("/rooms", { name: newRoomName });
      setNewRoomName("");
      setErrorMessage("");
      fetchRooms(); // refresh the room list
    } catch (error) {
      const message = error.response?.data?.message || "Could not create room";
      setErrorMessage(message);
    }
  }

  async function handleJoinRoom(roomId, roomName) {
    try {
      await api.post(`/rooms/${roomId}/join`);
      // Go to the chat room page
      navigate(`/chat/${roomId}`, { state: { roomName } });
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  }

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user?.username}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <form onSubmit={handleCreateRoom} className="create-room-form">
        <input
          type="text"
          placeholder="New room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button type="submit">Create Room</button>
      </form>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <h3>Available Rooms</h3>
      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room.id} className="room-item">
            <span>{room.name}</span>
            <button onClick={() => handleJoinRoom(room.id, room.name)}>
              Join
            </button>
          </li>
        ))}
        {rooms.length === 0 && <p>No rooms yet. Create one above!</p>}
      </ul>
    </div>
  );
}

export default Dashboard;
