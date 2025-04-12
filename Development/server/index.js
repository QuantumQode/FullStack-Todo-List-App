//This file sets up an Express server that connects to a MySQL database and handles user registration requests.

// These const variables import the dependencies.

require('dotenv').config();
// The express library is used to create the server and handle requests.
const express = require('express');

// DB connection
require('./src/config/db');

// app is a variable that contains the express function.
const app = express();
// The cors variable imports the cors library, which allows the server to accept requests from the client.
const cors = require('cors');



// Authentication libraries
// The bodyParser library is used to parse the body of incoming requests.
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');


// The app.use() function tells the server to use the express.json() and cors() middleware.
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// The app.use() function tells the server to use the bodyParser, cookieParser, and session middleware.
app.use(bodyParser.urlencoded({ extended: true }));



const authRoutes = require('./src/routes/auth');
app.use("/auth", authRoutes);

const taskRoutes = require('./src/routes/tasks');
app.use("/tasks", taskRoutes);



app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
