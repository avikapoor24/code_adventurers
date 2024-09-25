const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('code_adventures.db');

// Function to create tables
function createTables() {
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating Users table:', err.message);
        } else {
            console.log('Users table created or already exists.');
        }
    });

    // Create Game Data Table
    db.run(`CREATE TABLE IF NOT EXISTS GameData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        level_cleared INTEGER DEFAULT 0,
        achievements TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES Users(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating GameData table:', err.message);
        } else {
            console.log('GameData table created or already exists.');
        }
    });
}

// Export the db and createTables function
module.exports = {
    db,
    createTables
};
