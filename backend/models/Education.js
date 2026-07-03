import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  type:        { type: String, default: 'University' },
  institution: { type: String, required: true },
  degree:      { type: String, required: true },
  duration:    { type: String, required: true },
  grade:       { type: String, default: '' },
  highlights:  { type: [String], default: [] },
  icon:        { type: String, default: '🎓' },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

const ExperienceSchema = new mongoose.Schema({
  company:     { type: String, required: true },
  role:        { type: String, required: true },
  duration:    { type: String, required: true },
  description: { type: String, default: '' },
  tech:        { type: [String], default: [] },
  logo:        { type: String, default: '' },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

export const Education   = mongoose.model('Education',   EducationSchema);
export const Experience  = mongoose.model('Experience',  ExperienceSchema);
