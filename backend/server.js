// ── DNS Fix: Forces Node.js to use IPv4 resolution first.
// Windows and some cloud hosts sometimes resolve names using IPv6 first, which can cause connection timeouts when talking to MongoDB Atlas.
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Import our custom route controllers (endpoints to handle different API operations)
import portfolioRoutes  from './routes/portfolio.js';
import githubRoutes     from './routes/github.js';
import leetcodeRoutes   from './routes/leetcode.js';
import codeforcesRoutes from './routes/codeforces.js';
import codechefRoutes   from './routes/codechef.js';
import gfgRoutes        from './routes/gfg.js';
import contactRoutes    from './routes/contact.js';

// Load environmental variables from our offline .env file (secret keys, DB connection URI)
dotenv.config();

// Create an instance of an Express application.
// app serves as our backend logic engine, listening to client queries.
const app = express();

// ── Connect DB ──────────────────────────────────────────────
// Connects our backend to MongoDB Atlas on the cloud.
connectDB();

// ── Middleware ──────────────────────────────────────────────
// Middlewares are code interceptors that process incoming requests before they reach our routes.

// CORS (Cross-Origin Resource Sharing):
// Browser security allows websites to block external servers from making unauthorized requests.
// We parse the allowed frontend URLs from .env. If someone requests from a different origin, the browser blocks the connection.
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : '*',
  credentials: true,
}));

// Body Parser: Tells Express to parse incoming raw HTTP requests with JSON payloads so we can read them as JavaScript objects inside `req.body`.
app.use(express.json());

// Express Rate Limit:
// Security middleware to protect API endpoints from spam (like brute-force attacks on passcode login).
// Limits each client IP to a maximum of 200 requests within a 15-minute window.
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// ── Route Handlers ───────────────────────────────────────────
// We link request paths to the respective controller files.
app.use('/api/portfolio',   portfolioRoutes);  // Holds main data CRUD, bio information, experiences
app.use('/api/github',      githubRoutes);     // Syncs repositories, contributions graph
app.use('/api/leetcode',    leetcodeRoutes);   // Dynamic stats extraction for LeetCode
app.use('/api/codeforces',  codeforcesRoutes); // Dynamic stats extraction for Codeforces
app.use('/api/codechef',    codechefRoutes);   // Dynamic stats extraction for CodeChef
app.use('/api/gfg',         gfgRoutes);        // Dynamic stats extraction for GeeksForGeeks
app.use('/api/contact',     contactRoutes);    // Sends emails using Nodemailer

// ── Health & Root Check ──────────────────────────────────────
// Used to verify if the server is up and responsive (Health checks).
app.get('/', (_, res) => res.json({ success: true, message: '🚀 Ujjwal Portfolio Backend API is Live!', health: '/api/health' }));
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Global Error Handler Middleware ───────────────────────────
// If any backend code encounters an unexpected error (like DB connection loss), it is caught here,
// logging the error stack trace on the server and returning a clean 500 JSON error instead of crashing the process.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// Port Binding: Listen for incoming connections on PORT (default to 5000 in development).
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
