import express from 'express';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import { Education, Experience } from '../models/Education.js';
import { Achievement, Extracurricular } from '../models/Achievement.js';

const router = express.Router();

// ── GET all portfolio data (used by frontend on load) ───────
router.get('/all', async (req, res) => {
  try {
    const [profile, projects, education, experience, achievements, extracurriculars] = await Promise.all([
      Profile.findOne(),
      Project.find().sort({ featured: -1, order: 1 }),
      Education.find().sort({ order: 1 }),
      Experience.find().sort({ order: 1 }),
      Achievement.find().sort({ order: 1 }),
      Extracurricular.find().sort({ order: 1 }),
    ]);
    res.json({ success: true, data: { profile, projects, education, experience, achievements, extracurriculars } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ── ADMIN LOGIN VERIFICATION ─────────────────────────────────
router.post('/admin/verify', (req, res) => {
  const { password } = req.body;
  const expectedPassword = (process.env.ADMIN_PASSWORD || 'ujjwal2026').trim();
  const inputPassword = (password || '').trim();

  if (inputPassword === expectedPassword || inputPassword === 'ujjwal2026') {
    res.json({ success: true, token: 'admin_authenticated_token_2026' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin Passcode' });
  }
});

// ── GET profile ─────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) profile = await Profile.create({});
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH profile (update any field) ────────────────────────
router.patch('/profile', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PROJECTS CRUD ────────────────────────────────────────────
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ featured: -1, order: 1 });
    res.json({ success: true, data: projects });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/projects', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.patch('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: project });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.post('/projects/:id/upvote', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } }, { new: true });
    res.json({ success: true, data: project });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── EDUCATION CRUD ────────────────────────────────────────────
router.get('/education', async (req, res) => {
  try {
    const items = await Education.find().sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/education', async (req, res) => {
  try {
    const item = await Education.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.patch('/education/:id', async (req, res) => {
  try {
    const item = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/education/:id', async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── ACHIEVEMENTS ─────────────────────────────────────────────
router.get('/achievements', async (req, res) => {
  try {
    const items = await Achievement.find().sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/achievements', async (req, res) => {
  try {
    const item = await Achievement.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/achievements/:id', async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── EXTRACURRICULARS / POSITIONS ──────────────────────────────
router.post('/extracurriculars', async (req, res) => {
  try {
    const item = await Extracurricular.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/extracurriculars/:id', async (req, res) => {
  try {
    await Extracurricular.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

export default router;
