import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { createSocketConnection } from "../socket/socket.js";

function ChatRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const roomName = location.state?.roomName || "Chat Room";

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  // We use a "ref" to hold the socket so it doesn't get recreated
  // every time the component re-renders.
  const socketRef = useRef(null);

  // This ref helps us auto-scroll to the latest message
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. Load old messages from the database first
    loadOldMessages();

    // 2. Connect to the socket server
    const socket = createSocketConnection(token);
    socketRef.current = socket;

    // 3. Tell the server which room we want to join
    socket.emit("joinRoom", roomId);

    // 4. Listen for new incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // 5. Listen for the updated online users list
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // 6. Listen for system messages (someone joined/left)
    socket.on("systemMessage", (text) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: `system-${Date.now()}`, message: text, username: "System" },
      ]);
    });

    // Cleanup: disconnect the socket when we leave this page
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadOldMessages() {
    try {
      const response = await api.get(`/rooms/${roomId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }

  function handleSendMessage(e) {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Send the message to the server through the socket
    socketRef.current.emit("sendMessage", {
      roomId,
      message: newMessage,
    });

    setNewMessage("");
  }

  function handleLeaveRoom() {
    navigate("/dashboard");
  }

  return (
    <div className="chatroom-container">
      <div className="chatroom-sidebar">
        <h3>{roomName}</h3>
        <button onClick={handleLeaveRoom}>Back to Dashboard</button>

        <h4>Online Users</h4>
        <ul>
          {onlineUsers.map((username, index) => (
            <li key={index}>{username}</li>
          ))}
        </ul>
      </div>

      <div className="chatroom-main">
        <div className="messages-list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.username === user?.username
                  ? "message own-message"
                  : msg.username === "System"
                  ? "message system-message"
                  : "message other-message"
              }
            >
              <strong>{msg.username}: </strong>
              <span>{msg.message}</span>
            </div>
          ))}
          {/* This empty div helps us auto-scroll to the latest message */}
          <div ref={messagesEndRef}></div>
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default ChatRoom;
