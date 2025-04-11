/**
 * Authentication routes module
 * Implements JWT-based authentication
 */
const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const router = express.Router();
const jwt = require('jsonwebtoken');

// Utility function to query database (Promise wrapper)
const queryDB = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// Utility function to compare passwords
const comparePasswords = (password, hash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user exists
        const users = await queryDB('SELECT * FROM users WHERE userName = ?', [username]);
        
        if (users.length === 0) {
            return res.status(400).send('User does not exist');
        }

        // Compare passwords
        const isMatch = await comparePasswords(password, users[0].userPassword);
        
        if (isMatch) {
            // Generate JWT token instead of using session
            const token = jwt.sign(
              { id: users[0].id, username: users[0].userName },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN }
            );
            
            res.status(200).json({
              message: `${username} logged in successfully`,
              token: token
            });
          } else {
            res.status(400).send('Incorrect username or password');
          }
        } catch (error) {
          console.error('Login error:', error);
          res.status(500).send('Server error occurred');
        }
      });

// Registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUsers = await queryDB('SELECT * FROM users WHERE userName = ?', [username]);
        
        if (existingUsers.length > 0) {
            return res.status(400).send('User already exists');
        }

        // Hash password
        const hash = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        await queryDB('INSERT INTO users (userName, userPassword) VALUES (?, ?)', [username, hash]);
        
        res.status(200).send('User registered successfully');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Error registering user');
    }
});

module.exports = router;