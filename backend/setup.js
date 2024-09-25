const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { createTables } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = 'r^F6cT!a4xQ1z7wG3eHk!u&nR8oP*Y9z';

// Create a new SQLite database or open an existing one
const db = new sqlite3.Database('code_adventures.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Function to handle user signup
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run(`INSERT INTO Users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).send({ message: 'User already exists' });
        }
        const token = jwt.sign({ id: this.lastID }, JWT_SECRET);
        res.status(201).send({ token });
    });
});

// Function to handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM Users WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ accessToken: null, message: 'Invalid password' });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        res.status(200).send({ accessToken: token });
    });
});

// Get Game Data
app.get('/game-data/:userId', (req, res) => {
    const userId = req.params.userId;
    db.get(`SELECT * FROM GameData WHERE user_id = ?`, [userId], (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(data);
    });
});

// Update Game Data
app.post('/game-data', (req, res) => {
    const { userId, levelCleared, achievements } = req.body;

    db.run(`INSERT INTO GameData (user_id, level_cleared, achievements) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET level_cleared = excluded.level_cleared, achievements = excluded.achievements`, 
    [userId, levelCleared, achievements], function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        res.send({ message: 'Game data updated successfully' });
    });
});

// Create tables
createTables();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
