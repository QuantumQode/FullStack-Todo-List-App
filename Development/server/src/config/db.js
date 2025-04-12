// The mysql library is used to connect to the MySQL database.
const mysql = require('mysql');
require('dotenv').config();

//create connection to database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

//connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');

    // Create a variable that contains the SQL to create users table if it doesn't exist
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userName VARCHAR(255) NOT NULL,
            userPassword VARCHAR(255) NOT NULL
        )
    `;
    //create table
    db.query(createUsersTableQuery, (err, result) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        console.log('Users table created or already exists');
    });
});

// Create a variable that contains the SQL to create tasks table if it doesn't exist
const createTasksTableQuery = `
    CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('pending', 'completed') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        dueDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        userId INT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
`;

// Create tasks table
db.query(createTasksTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating tasks table:', err);
        return;
    }
    console.log('Tasks table created or already exists');
});

module.exports = db;