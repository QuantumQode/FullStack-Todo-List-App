//This file sets up an Express server that connects to a MySQL database and handles user registration requests.

// These const variables import the dependencies.


// The express library is used to create the server and handle requests.
const express = require('express');
require('dotenv').config();
// DB connection
require('./src/config/db');

// app is a variable that contains the express function.
const app = express();
// The cors variable imports the cors library, which allows the server to accept requests from the client.
const cors = require('cors');



// Authentication libraries
// The bodyParser library is used to parse the body of incoming requests.
const bodyParser = require('body-parser');
// The cookieParser library is used to parse cookies in the request headers.
const cookieParser = require('cookie-parser');
// The session library is used to create sessions for users.
const session = require('express-session');


// The app.use() function tells the server to use the express.json() and cors() middleware.
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

// The app.use() function tells the server to use the bodyParser, cookieParser, and session middleware.
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


// The app.use() function tells the server to use the session middleware with the specified options.
app.use(session({
    key: 'userId',
    secret: 'QuantumQoder1!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24 * 1000,
    },
}));

const authRoutes = require('./src/routes/auth');


app.use("/auth",authRoutes);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
