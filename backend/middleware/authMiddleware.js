// This middleware checks if the request has a valid JWT token.
// If the token is valid, it lets the request continue.
// If not, it blocks the request with an error.

const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  // The frontend should send the token like this:
  // Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // get the part after "Bearer"

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Save the decoded user info so the next function can use it
    req.user = decoded; // { id, username }
    next();
  });
}

module.exports = verifyToken;
