-- Database Initialization Script

PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS users;
PRAGMA foreign_keys = ON;

-- 1. USERS TABLE
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. QUIZZES TABLE 
CREATE TABLE quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    author_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. QUESTIONS TABLE
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 4. PERFORMANCE INDEXES (Green IT Optimization)
CREATE INDEX idx_quiz_author ON quizzes(author_id);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_quiz_category ON quizzes(category);

-- 5. SEED DATA (For Demo Purposes)
INSERT INTO users (username, email, password_hash) 
VALUES ('EcoUser', 'test@efrei.fr', 'hashed_password_here');

INSERT INTO quizzes (title, description, author_id) 
VALUES ('Digital Sustainability', 'Test your knowledge on IT impact.', 1);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
VALUES (1, 'Which image format is most eco-friendly?', 'PNG', 'JPEG', 'WebP', 'BMP', 'C');