-- Database Initialization Script
/*
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS users;
PRAGMA foreign_keys = ON;
*/ 

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user'
);

-- 2. QUIZZES TABLE 
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
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

-- 4. SCORES TABLE (The link between Users and Quizzes)
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 5. PERFORMANCE INDEXES (Green IT Optimization)
CREATE INDEX idx_quiz_user ON quizzes(user_id);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_quiz_category ON quizzes(category);
CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_scores_quiz ON scores(quiz_id);

-- 6. SEED DATA (For Demo Purposes)
INSERT INTO users (username, email, password_hash, role) 
VALUES ('EcoUser', 'test@efrei.fr', '$2a$12$tAMi5uNSGDlUMz5WwO8qtOpm6SvV6aHtlrTyRI83DIArSJdOln.3e', 'admin');

INSERT INTO quizzes (title, description, difficulty, user_id) 
VALUES ('Digital Sustainability', 'Test your knowledge on IT impact.', 'Easy', 1);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
VALUES (1, 'Which image format is most eco-friendly?', 'PNG', 'JPEG', 'WebP', 'BMP', 'C');


CREATE TRIGGER IF NOT EXISTS limit_user_quizzes
BEFORE INSERT ON quizzes
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN (SELECT COUNT(*) FROM quizzes WHERE quizzes.user_id = NEW.user_id) >= 5
        THEN RAISE(ABORT, 'Quiz limit reached. Please delete an existing quiz before creating a new one.')
    END;
END;
