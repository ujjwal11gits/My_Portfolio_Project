# 🚀 Ujjwal Choubey — MERN Stack Portfolio Website

A world-class, multi-page modern developer portfolio built with the **MERN Stack** (MongoDB, Express.js, React + Vite, Node.js). Inspired by Codolio's competitive programming dashboard aesthetic with full academic and developer story integration.

---

## ✨ Features & Highlights

- **Hero / Landing Page (`Home.jsx`)**: Full-screen particle constellation, glowing custom cursor, typewriter cycling roles, spinning profile photo frame, floating badges, and quick stats.
- **About Me Page (`About.jsx`)**: Personal bio, animated counters, interests cloud, interactive skill progress bars, vertical education timeline, and extra-curricular cards.
- **Coding Dashboard (`Coding.jsx`)**: Codolio-inspired dashboard with live platform stats (LeetCode, Codeforces, CodeChef, GeeksForGeeks), Easy/Med/Hard Donut breakdown, rating progression line chart, DSA topic bar analysis, and contest rankings.
- **Dev Stats Page (`DevStats.jsx`)**: GitHub contribution heatmap, top languages stacked bar, repository stats (Stars, Forks, Followers), and pinned repositories.
- **Projects Page (`Projects.jsx`)**: Spotlight featured project card, category filter tabs (Web Dev, ML/AI, DSA, App, CLI), and project cards grid.
- **Achievements Page (`Achievements.jsx`)**: Verified certifications grid and hackathons timeline.
- **Contact Page (`Contact.jsx`)**: Interactive contact form powered by Express + Nodemailer, copy-to-clipboard email button, and social links.
- **MongoDB Atlas Integration**: All portfolio content is dynamically served from MongoDB Atlas and can be edited without modifying codebase files.
- **Live API Proxying**: Express server proxies LeetCode, Codeforces, CodeChef, and GitHub APIs with server-side caching (1-hour TTL) to bypass CORS restrictions and rate limits.

---

## 📁 Folder Structure

```
D:\Ujjwal_Portfolio_project\
├── client/                     # React Frontend (Vite)
│   ├── public/assets/images/   # Static profile & project images
│   ├── src/
│   │   ├── components/         # Navbar, Footer, Cursor, DonutChart, RatingChart
│   │   ├── context/            # PortfolioContext (Global MongoDB Data State)
│   │   ├── hooks/              # API hooks
│   │   ├── pages/              # Home, About, Coding, DevStats, Projects, Achievements, Contact
│   │   ├── styles/             # Global CSS design system variables & reset
│   │   └── utils/              # Axios API helpers
│   └── vite.config.js          # Vite configuration with API proxy to port 5000
│
├── server/                     # Express.js Backend Server
│   ├── config/                 # db.js (MongoDB Atlas Connection)
│   ├── models/                 # Profile, Project, Education, Achievement schemas
│   ├── routes/                 # Portfolio, GitHub, LeetCode, Codeforces, CodeChef, Contact routes
│   ├── seed.js                 # Initial Database Seed Script
│   └── server.js               # Express Server Entry Point (Port 5000)
│
├── .env                        # Environment variables (DB URI, Port, Email, GitHub Token)
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB Atlas Connection String** (Configured in `.env`)

### 2. Running Backend Server
```bash
cd server
npm start        # Starts Express server on http://localhost:5000
```
*To run in development mode with auto-reload:*
```bash
npm run dev
```

### 3. Running React Frontend
```bash
cd client
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## ✏️ How to Edit & Update Data

Everything on the site is dynamic! You can update your data in two ways:

### Method 1: Via MongoDB Atlas (Recommended)
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Go to `Database` -> `Browse Collections` under `Balor_DB`.
3. Edit the `profiles` collection document to change your name, bio, social links, or coding handles (`@bytewiz_ujjwal`).
4. Add or edit entries in `projects`, `educations`, `achievements`, or `extracurriculars` collections.

### Method 2: Re-running the Seed Script
If you want to reset or update default seed data:
1. Open `server/seed.js` and modify the default objects.
2. Run `node seed.js` inside the `server/` directory.

---

## 🎨 Design Tokens

- **Primary Gradient**: Deep Violet `#8b5cf6` → Electric Cyan `#06b6d4`
- **Background**: `#05050f` (Dark Mode Base)
- **Typography**: Inter (Body/Headings) + JetBrains Mono (Code/Numbers)
