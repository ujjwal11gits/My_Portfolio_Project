import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  type:        { type: String, enum: ['certification','hackathon','award','milestone'], default: 'certification' },
  issuer:      { type: String, default: '' },
  position:    { type: String, default: '' },
  date:        { type: String, default: '' },
  description: { type: String, default: '' },
  link:        { type: String, default: '#' },
  logo:        { type: String, default: '' },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

const ExtracurricularSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  organization: { type: String, default: '' },
  description:  { type: String, default: '' },
  icon:         { type: String, default: '🌟' },
  order:        { type: Number, default: 0 },
}, { timestamps: true });

export const Achievement     = mongoose.model('Achievement',     AchievementSchema);
export const Extracurricular = mongoose.model('Extracurricular', ExtracurricularSchema);
