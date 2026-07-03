import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  tagline:     { type: String, default: '' },
  description: { type: String, required: true },
  logo:        { type: String, default: '' },
  image:       { type: String, default: '' },
  tech:        { type: [String], default: [] },
  github:      { type: String, default: '#' },
  repoName:    { type: String, default: '' },
  live:        { type: String, default: '#' },
  category:    { type: String, enum: ['Web Dev','ML/AI','DSA','App','CLI','Other'], default: 'Web Dev' },
  featured:    { type: Boolean, default: false },
  features:    { type: [String], default: [] },
  upvotes:     { type: Number, default: 1 },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);
