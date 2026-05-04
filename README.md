# Sustainable Digital Project — Setup Guide

## Project Structure

```
project-root/
├── server.js              ← Express backend (NEW)
├── package.json           ← Updated with dependencies
├── database/
│   ├── db.js              ← Fixed (author_id bug)
│   └── init.sql           ← Unchanged
└── frontend/
    ├── index.html         ← Live leaderboard (UPDATED)
    ├── quiz.html          ← Fully wired to API (UPDATED)
    ├── register.html      ← Auth forms wired to API (UPDATED)
    └── styles.css         ← Unchanged
```

## Installation

```bash
npm install
```

## Run

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

The server starts at **http://localhost:3000**

---

## API Reference

### Auth
| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/api/register` | `{ nickname, email, password, confirmPassword }` | Create account |
| POST | `/api/login` | `{ email, password }` | Log in |
| POST | `/api/logout` | — | Log out |
| GET  | `/api/me` | — | Current session info |

### Quizzes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET  | `/api/quizzes` | No | List all quizzes |
| POST | `/api/quizzes` | ✅ | Create a quiz `{ title, difficulty }` |
| DELETE | `/api/quizzes/:id` | ✅ (author only) | Delete a quiz |

### Questions
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET  | `/api/quizzes/:id/questions` | No | Get questions for a quiz |
| POST | `/api/quizzes/:id/questions` | ✅ (author only) | Add a question |

### Scores & Leaderboard
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/quizzes/:id/scores` | ✅ | Submit score `{ score }` |
| GET  | `/api/quizzes/:id/leaderboard` | No | Per-quiz leaderboard |
| GET  | `/api/leaderboard` | No | Global leaderboard |

---

## Bug Fixed

`db.js` — `createQuiz` was inserting into column `user_id` which does not exist in the schema.
The schema defines `author_id`. This has been corrected.
