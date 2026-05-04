const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'quiz-secret-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,          // set true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60  // 1 hour
    }
}));

// ─── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'You must be logged in.' });
    }
    next();
}

// ─── Auth routes ──────────────────────────────────────────────────────────────

/**
 * POST /api/register
 * Body: { nickname, email, password, confirmPassword }
 */
app.post('/api/register', async (req, res) => {
    const { nickname, email, password, confirmPassword } = req.body;

    if (!nickname || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);
        db.registerUser(nickname, email, passwordHash, (err, userId) => {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Username or email already taken.' });
                }
                console.error('Register error:', err);
                return res.status(500).json({ error: 'Registration failed.' });
            }
            req.session.userId = userId;
            req.session.username = nickname;
            res.status(201).json({ message: 'Account created!', userId, username: nickname });
        });
    } catch (err) {
        console.error('Bcrypt error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

/**
 * POST /api/login
 * Body: { email, password }
 */
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const sql = `SELECT id, username, password_hash FROM users WHERE email = ?`;
    db.db.get(sql, [email], async (err, user) => {
        if (err) {
            console.error('Login DB error:', err);
            return res.status(500).json({ error: 'Server error.' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        try {
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            req.session.userId = user.id;
            req.session.username = user.username;
            res.json({ message: 'Logged in!', userId: user.id, username: user.username });
        } catch (err) {
            console.error('Bcrypt compare error:', err);
            res.status(500).json({ error: 'Server error.' });
        }
    });
});

/**
 * POST /api/logout
 */
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Could not log out.' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully.' });
    });
});

/**
 * GET /api/me  — return current session info
 */
app.get('/api/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ loggedIn: false });
    }
    res.json({ loggedIn: true, userId: req.session.userId, username: req.session.username });
});

// ─── User routes ──────────────────────────────────────────────────────────────

/**
 * GET /api/users  — list all users (id + username only)
 */
app.get('/api/users', requireAuth, (req, res) => {
    db.getAllUsers((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * GET /api/users/:id
 */
app.get('/api/users/:id', requireAuth, (req, res) => {
    db.getUserById(req.params.id, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found.' });
        res.json(row);
    });
});

// ─── Quiz routes ──────────────────────────────────────────────────────────────

/**
 * GET /api/quizzes  — list all quizzes
 */
app.get('/api/quizzes', (req, res) => {
    db.getAllQuizzes((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * POST /api/quizzes  — create a new quiz (auth required)
 * Body: { title, difficulty }
 */
app.post('/api/quizzes', requireAuth, (req, res) => {
    const { title, difficulty } = req.body;

    if (!title || !difficulty) {
        return res.status(400).json({ error: 'Title and difficulty are required.' });
    }
    const allowed = ['Easy', 'Medium', 'Hard'];
    if (!allowed.includes(difficulty)) {
        return res.status(400).json({ error: `Difficulty must be one of: ${allowed.join(', ')}.` });
    }

    db.createQuiz(title, difficulty, req.session.userId, (err, quizId) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Quiz created.', quizId });
    });
});

/**
 * DELETE /api/quizzes/:id  — delete a quiz (only the author)
 */
app.delete('/api/quizzes/:id', requireAuth, (req, res) => {
    db.getQuizOwner(req.params.id, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Quiz not found.' });
        if (row.author_id !== req.session.userId) {
            return res.status(403).json({ error: 'You are not the author of this quiz.' });
        }
        db.deleteQuiz(req.params.id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Quiz deleted.' });
        });
    });
});

// ─── Question routes ──────────────────────────────────────────────────────────

/**
 * GET /api/quizzes/:id/questions
 */
app.get('/api/quizzes/:id/questions', (req, res) => {
    db.getQuestionsByQuizId(req.params.id, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

/**
 * POST /api/quizzes/:id/questions  — add a question (author only)
 * Body: { question_text, option_a, option_b, option_c, option_d, correct_answer }
 */
app.post('/api/quizzes/:id/questions', requireAuth, (req, res) => {
    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
        return res.status(400).json({ error: 'All question fields are required.' });
    }
    if (!['A', 'B', 'C', 'D'].includes(correct_answer.toUpperCase())) {
        return res.status(400).json({ error: 'correct_answer must be A, B, C, or D.' });
    }

    db.getQuizOwner(req.params.id, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Quiz not found.' });
        if (row.author_id !== req.session.userId) {
            return res.status(403).json({ error: 'Only the author can add questions.' });
        }

        const sql = `INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.db.run(sql,
            [req.params.id, question_text, option_a, option_b, option_c, option_d, correct_answer.toUpperCase()],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Question added.', questionId: this.lastID });
            });
    });
});

// ─── Score routes ─────────────────────────────────────────────────────────────

/**
 * POST /api/quizzes/:id/scores  — submit a score
 * Body: { score }
 */
app.post('/api/quizzes/:id/scores', requireAuth, (req, res) => {
    const { score } = req.body;
    if (score === undefined || score === null) {
        return res.status(400).json({ error: 'Score is required.' });
    }

    db.saveUserScore(req.session.userId, req.params.id, score, (err, scoreId) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Score saved.', scoreId });
    });
});

/**
 * GET /api/quizzes/:id/leaderboard?limit=10
 */
app.get('/api/quizzes/:id/leaderboard', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    db.getLeaderboardByQuiz(req.params.id, limit, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── Global leaderboard (across all quizzes) ──────────────────────────────────

/**
 * GET /api/leaderboard?limit=10
 */
app.get('/api/leaderboard', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const sql = `
        SELECT u.username, SUM(s.score) AS total_score, COUNT(s.id) AS quizzes_taken
        FROM scores s
        JOIN users u ON s.user_id = u.id
        GROUP BY s.user_id
        ORDER BY total_score DESC
        LIMIT ?`;
    db.db.all(sql, [limit], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ─── Catch-all: serve frontend pages ─────────────────────────────────────────

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`✅  Server running at http://localhost:${PORT}`);
});
