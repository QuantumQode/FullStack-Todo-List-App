//This file sets up an Express server that connects to a MySQL database and handles user registration requests.

// These const variables import the dependencies.


// The express library is used to create the server and handle requests.
const express = require('express');
// The mysql library is used to connect to the MySQL database.
const mysql = require('mysql');
// app is a variable that contains the express function.
const app = express();
// The cors variable imports the cors library, which allows the server to accept requests from the client.
const cors = require('cors');

// Encryption libraries
// The bcrypt library is used to hash passwords before storing them in the database.
const bcrypt = require('bcrypt');
const saltRounds = 10;

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


//create connection to database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'QuantumXena1',
    database: 'todo-list'
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

//create a post endpoint for user registration
app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // first we must check if the username already exists in the database
    db.query('SELECT * FROM users WHERE userName = ?', [username], (err, result) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Server error occured');
            
        }

        if (result.length > 0) {
            return res.status(400).send('User already exists');
        }

        // If username does NOT EXIST, we can proceed to hash the password and insert the user into the database
        // Hash the password
        bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            // Log the error to the console and send a 500 status code to the client.
            console.error('Error hashing password:', err);
            res.status(500).send('Error registering user');
            return;
        }

        //insert userName and hashed userPassword into database
        db.query(
            'INSERT INTO users (userName, userPassword) VALUES (?, ?)',
            [username, hash],
            (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    res.status(500).send('Error inserting user');
                } else {
                    res.status(200).send('User registered successfully');
                }
            }
        );
});
})
    
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        const { userPassword, ...userWithoutPassword } = req.session.user;
        res.json({
            loggedIn: true,
            username: userWithoutPassword});
    } else {
        res.json({ loggedIn: false });
    }
});


//create a post endpoint for user login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    //check if user exists
    db.query(
        'SELECT * FROM users WHERE userName = ?;',
        [username],
        (err, result) => {
            if (err) {
                console.error('Error checking user:', err);
                res.status(500).send('Server error occured');
            } else {
                if (result.length > 0) {
                    bcrypt.compare(password, result[0].userPassword, (error, response) => {
                        if (response) {
                            req.session.user = result[0];
                            res.status(200).send(username + 'Logged in successfully');
                        } else {
                            res.status(400).send('Incorrect username or password');
                        }
                    });
                } else {
                    res.status(400).send('User does not exist');
                }
            }
        }
    );
});



app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
