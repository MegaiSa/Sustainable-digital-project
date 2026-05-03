const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Paths for the database file and the initialization script
const dbPath = path.join(__dirname, 'database.db');
const initSqlPath = path.join(__dirname, 'init.sql');

// Database Connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error("Connection Error:", err.message);
    console.log("Connected to the SQLite database.");
    
    // Initialize tables if the database was just created
    initDatabase();
});

/**
 * Reads the init.sql file and executes it to set up the schema
 */
function initDatabase() {
    const sql = fs.readFileSync(initSqlPath, 'utf8');
    db.exec(sql, (err) => {
        if (err) console.error("Error during table initialization:", err.message);
        else console.log("Tables initialized successfully!");
    });
}

module.exports = db;