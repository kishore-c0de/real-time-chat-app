// This file creates a connection pool to our MySQL database.
// A "pool" just means Node can reuse multiple connections instead of
// opening a brand new one every time we run a query.

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

// DB_CA_CERT holds a FILE PATH to the CA certificate, not the cert content.
// Locally this falls back to backend/ca.pem; on Render it should be set to
// /etc/secrets/ca.pem (the path of the mounted Secret File).
const caCertPath = process.env.DB_CA_CERT || path.join(__dirname, "../ca.pem");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync(caCertPath),
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;