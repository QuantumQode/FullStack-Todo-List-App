/**
 * Database configuration module
 */
const mysql = require('mysql');
require('dotenv').config();

// Create connection to database with proper error handling
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');

    // SQL to create users table if it doesn't exist
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userName VARCHAR(255) NOT NULL UNIQUE,
            userPassword VARCHAR(255) NOT NULL
        )
    `;
    // Create table
    db.query(createUsersTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        console.log('Users table created or already exists');
    });
});

// Handle unexpected disconnections
db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed. Attempting to reconnect...');
        // Attempt to reconnect
        db.connect((err) => {
            if (err) {
                console.error('Error reconnecting to the database:', err);
                return;
            }
            console.log('Reconnected to the database');
        });
    } else {
        throw err;
    }
});

module.exports = db;