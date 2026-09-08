# 💬 Real-Time Chat Application

A full-stack real-time chat application built with React, Express.js, Socket.IO, MySQL, and JWT authentication.

🔗 **Live Demo:** https://bruh-17u.vercel.app/

## ✨ Features

- 🔐 User registration and login
- 🔑 JWT-based authentication
- 🔒 Password hashing with bcrypt
- 💬 Real-time messaging with Socket.IO
- 👥 Online users in chat rooms
- 🏠 Create and join chat rooms
- 💾 Persistent messages stored in MySQL
- 🛡️ Protected API routes using JWT middleware
- 📱 Responsive chat interface

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- MySQL
- JWT
- bcrypt

### Deployment

- Vercel — Frontend
- Render — Backend
- Aiven — MySQL Database

---

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── config/db.js              # MySQL connection
│   ├── controllers/               # Business logic (auth, rooms)
│   ├── middleware/authMiddleware.js  # JWT verification
│   ├── routes/                    # API route definitions
│   ├── socket/socketHandler.js    # Real-time Socket.io logic
│   ├── sql/schema.sql             # Database tables
│   ├── server.js                  # Main server entry point
│   └── .env.example               # Environment variable template
│
└── frontend/
    └── src/
        ├── api/axios.js           # Axios instance (auto-attaches JWT)
        ├── context/AuthContext.jsx # Stores logged-in user globally
        ├── socket/socket.js       # Socket.io client setup
        ├── pages/                 # Login, Register, Dashboard, ChatRoom
        ├── components/PrivateRoute.jsx # Protects logged-in-only pages
        └── App.jsx                # Routing
```

---

## 🛠️ Step 1: Set up MySQL

1. Make sure MySQL is installed and running on your computer.
2. Run the schema file to create the database and tables:

```bash
mysql -u root -p < backend/sql/schema.sql
```

This creates a database called `chat_app` with 4 tables:
`users`, `rooms`, `room_members`, and `messages`.

---

## 🛠️ Step 2: Set up the Backend

```bash
cd backend
npm install
```

Now create your own `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your real MySQL password and a JWT secret
(any random long string works, e.g. `mysecretkey123`).

Start the backend server:

```bash
npm run dev
```

You should see: `Server is running on http://localhost:5000`

---

## 🛠️ Step 3: Set up the Frontend

Open a **new terminal window** (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

You should see something like: `Local: http://localhost:3000`

Open that link in your browser.

---

## ✅ How to Use the App

1. Go to `http://localhost:3000` → you'll land on the Login page.
2. Click "Register here" to create a new account.
3. Log in with your new username/password.
4. On the Dashboard, create a new chat room (e.g. "General").
5. Click "Join" to enter the room.
6. Open the same room in another browser tab/window (or log in with a
   second account) to test real-time messaging and the online users list.

---

## 🔑 How the Pieces Fit Together (for learning)

- **Register/Login** → Backend checks/saves user in MySQL, returns a
  JWT token → Frontend saves the token in `localStorage`.
- **Every API request** (like creating a room) → Axios automatically
  attaches the saved JWT token in the `Authorization` header.
- **Backend middleware** (`authMiddleware.js`) checks that token before
  allowing access to protected routes.
- **Joining a chat room** → Frontend connects to Socket.io, sending the
  JWT token during the handshake so the backend knows who's connecting.
- **Sending a message** → Frontend emits a `sendMessage` socket event →
  Backend saves it to MySQL → Backend broadcasts it to everyone in that
  room via `receiveMessage`.
- **Online/offline presence** → Backend keeps a simple in-memory list of
  who's connected to each room, and updates everyone whenever someone
  joins or disconnects.

---

## 💡 Notes for Beginners

- No advanced patterns are used here (no Redux, no TypeScript, no ORM) —
  just plain React hooks (`useState`, `useEffect`, `useContext`) and
  plain SQL queries with `mysql2`.
- Passwords are never stored in plain text — they're hashed with bcrypt.
- The JWT token expires after 1 day (you'll need to log in again after that).
- Feel free to open each file — every function has comments explaining
  what it does and why.
