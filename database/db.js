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

// Create a new quiz
const createQuiz = (title, difficulty, userId, callback) => {
    const sql = `INSERT INTO quizzes (title, difficulty, user_id) VALUES (?, ?, ?)`;
    db.run(sql, [title, difficulty, userId], function(err) {
        callback(err, this.lastID);
    });
};

// Get the owner of a quiz
const getQuizOwner = (quizId, callback) => {
    const sql = `SELECT user_id FROM quizzes WHERE id = ?`;
    db.get(sql, [quizId], (err, row) => {
        callback(err, row);
    });
};

// Delete a quiz
const deleteQuiz = (quizId, callback) => {
    const sql = `DELETE FROM quizzes WHERE id = ?`;
    db.run(sql, [quizId], (err) => {
        callback(err);
    });
};

// Get top scores for a specific quiz (Leaderboard)
const getLeaderboardByQuiz = (quizId, limit = 10, callback) => {
    const sql = `
        SELECT u.username, s.score, s.completed_at
        FROM scores s
        JOIN users u ON s.user_id = u.id
        WHERE s.quiz_id = ?
        ORDER BY s.score DESC
        LIMIT ?`;
    db.all(sql, [quizId, limit], (err, rows) => {
        callback(err, rows);
    });
};

// Get essential user info (for profile/leaderboard)
const getAllUsers = (callback) => {
    const sql = `SELECT id, username FROM users`;
    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
};

const getUserById = (id, callback) => {
    const sql = `SELECT id, username, email FROM users WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        callback(err, row);
    });
};

// Get quiz list for the menu
const getAllQuizzes = (callback) => {
    const sql = `SELECT id, title, difficulty FROM quizzes`;
    db.all(sql, [], (err, rows) => {
        callback(err, rows);
    });
};

// Get questions for a quiz session
const getQuestionsByQuizId = (quizId, callback) => {
    const sql = `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer FROM questions WHERE quiz_id = ?`;
    db.all(sql, [quizId], (err, rows) => {
        callback(err, rows);
    });
};

// Insert a new score
const saveUserScore = (userId, quizId, score, callback) => {
    const sql = `INSERT INTO scores (user_id, quiz_id, score, completed_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`;
    db.run(sql, [userId, quizId, score], function(err) {
        callback(err, this.lastID);
    });
};

// Create a new user (Sign-up)
const registerUser = (username, email, passwordHash, callback) => {
    const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
    db.run(sql, [username, email, passwordHash], function(err) {
        callback(err, this.lastID);
    });
};

const updateQuiz = (id, title, description, category, difficulty, callback) => {
    const sql = `UPDATE quizzes SET title = ?, description = ?, category = ?, difficulty = ? WHERE id = ?`;
    db.run(sql, [title, description, category, difficulty, id], callback);
};

const updateQuestion = (id, text, answer, options, callback) => {
    const sql = `UPDATE questions SET question_text = ?, correct_answer = ?, options_json = ? WHERE id = ?`;
    db.run(sql, [text, answer, options, id], callback);
};

const deleteQuestion = (id, callback) => {
    const sql = `DELETE FROM questions WHERE id = ?`;
    db.run(sql, [id], callback);
};


module.exports = {
    db,
    getAllUsers,
    getUserById,
    getAllQuizzes,
    getQuestionsByQuizId,
    getQuizOwner,
    saveUserScore,
    getLeaderboardByQuiz,
    createQuiz,
    deleteQuiz,
    registerUser,
    updateQuiz,
    updateQuestion,
    deleteQuestion
};  
