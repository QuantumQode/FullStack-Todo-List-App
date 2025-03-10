/**
 * Main server entry point
 * Sets up Express server with middleware and routes
 */
 
// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Initialize database connection
require('./src/config/db');

// Create Express app
const app = express();

// Configure CORS
app.use(cors({
    origin: process.env.BACKEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Configure middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Import and use routes
const authRoutes = require('./src/routes/auth');
app.use('/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).send('Server is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('An unexpected error occurred');
});

// Set port and start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});