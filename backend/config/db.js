// This file creates a connection pool to our MySQL database.
// A "pool" just means Node can reuse multiple connections instead of
// opening a brand new one every time we run a query.

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        // In production, set DB_CA_CERT as an environment variable (paste the
        // full ca.pem contents) so the certificate never has to be committed
        // to git. Locally, it falls back to reading backend/ca.pem from disk.
        ca: process.env.DB_CA_CERT || fs.readFileSync(path.join(__dirname, "../ca.pem")),
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;