# Sustainable Digital Project — Interactive Quiz Platform

## 1. Project Description
The **Sustainable Digital Project** is a lightweight, eco-conscious web application designed to host and manage quizzes with a primary focus on Digital Sustainability knowledge. The platform allows users to register, create their own quizzes, and compete on a global leaderboard, all while maintaining a minimal digital footprint through optimized backend and database structures. This project serves as a practical implementation of Green IT principles in web development.

## 2. Deployed Site
You can access the live version of the project here:  
**[👉 Click here to view the Deployed Site](https://sustainabledigital.vendredicorp.fr/)**

## 3. Team Members and Roles
| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Anthony Varela** | Database | SQL schema design, SQLite optimization, and data persistence. |
| **Louis Demoy** | Frontend | UI/UX design, sustainable CSS, and client-side logic. |
| **Tristan Pichard** | Backend | Server-side logic, API development. |

## 4. Technical Stack & Green IT Justification
The project was built using a "Lean" architecture to minimize energy consumption and resource usage.

*   **Hosting:** **Raspberry Pi** — Chosen for its extremely low power consumption (under 7W), significantly reducing the carbon footprint compared to standard high-performance servers.
*   **Runtime:** **Node.js** with **Express.js** — Selected for its asynchronous nature, allowing for high concurrency with low CPU overhead.
*   **Database:** **SQLite3** — A serverless, file-based database that eliminates the need for a separate database server process, reducing idle energy consumption.
*   **Green IT Optimizations:**
    *   **SQL Indexing:** Optimized indexes ensure minimal disk I/O and faster query execution.
    *   **Minimalist Frontend:** CSS-only styling without heavy JavaScript frameworks to reduce client-side CPU processing.

## 5. Installation & Local Setup
Follow these steps to run the project on your local machine.

### Prerequisites
*   Node.js (v18+ recommended)
*   npm

### Steps
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/megaisa/sustainable-digital-project.git](https://github.com/megaisa/sustainable-digital-project.git)
    cd sustainable-digital-project
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the application:**
    ```bash
    npm start
    ```
4.  **Access the site:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Repository Structure
```text
project-root/
├── .github/workflows/    ← Automated Docker build pipeline
├── database/             ← Database logic and persistence
│   ├── db.js             ← Connection logic and CRUD queries
│   ├── init.sql          ← Schema definition with performance indexes
│   └── database.db       ← SQLite data file
├── frontend/             ← Client-side static assets
│   ├── index.html        ← Landing page & Global Leaderboard
│   ├── quiz.html         ← Interactive Quiz interface
│   ├── register.html     ← User registration
│   ├── handler.html      ← Quiz management interface
│   └── styles.css        ← Eco-friendly UI styling
├── server.js             ← Express server and API endpoints
├── Dockerfile            ← Optimized Alpine-based Docker config
├── package.json          ← Project metadata and dependencies
└── README.md             ← Project documentation
```

## 7. Project Report
[Click here to read the Final Technical Report (PDF)](./docs/Report_TI616_TeamX.pdf)
