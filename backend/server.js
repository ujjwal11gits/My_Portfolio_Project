// ── DNS Fix: Must be FIRST — forces IPv4 for Node.js DNS (fixes Atlas SRV on Windows)
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Routes
import portfolioRoutes  from './routes/portfolio.js';
import githubRoutes     from './routes/github.js';
import leetcodeRoutes   from './routes/leetcode.js';
import codeforcesRoutes from './routes/codeforces.js';
import codechefRoutes   from './routes/codechef.js';
import contactRoutes    from './routes/contact.js';

dotenv.config();

const app = express();

// ── Connect DB ──────────────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Rate limiter — protect API endpoints
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// ── Routes ──────────────────────────────────────────────────
app.use('/api/portfolio',   portfolioRoutes);
app.use('/api/github',      githubRoutes);
app.use('/api/leetcode',    leetcodeRoutes);
app.use('/api/codeforces',  codeforcesRoutes);
app.use('/api/codechef',    codechefRoutes);
app.use('/api/contact',     contactRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
