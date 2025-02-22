const express = require('express');
// Encryption libraries
// The bcrypt library is used to hash passwords before storing them in the database.
const bcrypt = require('bcrypt');
const saltRounds = 10;


const router = express.Router();

//create a post endpoint for user login
router.post('/login', (req, res) => {
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
                    bcrypt.compare(password, result[0].userPassword, (response) => {
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

//create a post endpoint for user registration
router.post('/register', (req, res) => {
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
        bcrypt.hash(password, saltRounds, (hash) => {
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



module.exports = router;