/**
 * Authentication routes module
 * Implements JWT-based authentication
 */
const express = require('express'); 
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const env = require('dotenv').config();

// Salt rounds for bcrypt
const saltRounds = process.env.SALT_ROUNDS;

// Utility function to query database (Promise wrapper)
const queryDB = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['x-access-token'];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * Login endpoint
 * Validates user credentials and issues a JWT
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }
        
        // Check if user exists
        const users = await queryDB('SELECT * FROM users WHERE userName = ?', [username]);
        
        if (users.length === 0) {
            return res.status(400).send('Invalid credentials');
        }

        // Compare passwords
        const match = await bcrypt.compare(password, users[0].userPassword);
        
        if (match) {
            // Create JWT payload
            const user = {
                id: users[0].id,
                username: users[0].userName
            };
            
            // Generate JWT token
            const token = jwt.sign(
                user,
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );
            
            // Set token in cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            
            // Send response
            return res.status(200).json({
                message: 'Login successful',
                user,
                token
            });
        } else {
            return res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('An error occurred during login');
    }
});

/**
 * Registration endpoint
 * Creates a new user account
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }

        // Check if user exists
        const existingUsers = await queryDB('SELECT * FROM users WHERE userName = ?', [username]);
        
        if (existingUsers.length > 0) {
            return res.status(400).send('Username already taken');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        await queryDB('INSERT INTO users (userName, userPassword) VALUES (?, ?)', [username, hashedPassword]);
        
        return res.status(201).send('Registration successful');
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('An error occurred during registration');
    }
});

/**
 * Logout endpoint
 * Clears the JWT cookie
 */
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send('Logged out successfully');
});

/**
 * Session check endpoint
 * Verifies if user is authenticated using JWT
 */
router.get('/check-session', verifyToken, async (req, res) => {
    try {
        // Get user data from database using the ID from the token
        const users = await queryDB('SELECT id, userName FROM users WHERE id = ?', [req.userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
            loggedIn: true,
            user: {
                id: users[0].id,
                username: users[0].userName
            }
        });
    } catch (error) {
        console.error('Session check error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;