import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  name:        { type: String, default: 'Ujjwal Choubey' },
  username:    { type: String, default: 'Ujjwal_Choubey' },
  taglines:    { type: [String], default: ['Full Stack Developer','Competitive Programmer','Problem Solver','DSA Enthusiast','Open Source Contributor','Tech Explorer'] },
  bio:         { type: String, default: "I'm a passionate developer and competitive programmer who loves turning complex problems into elegant solutions. Whether it's crafting pixel-perfect UIs, solving DSA challenges, or building full-stack applications — I do it all with curiosity and dedication." },
  location:    { type: String, default: 'India' },
  institute:   { type: String, default: 'Your College / University' },
  degree:      { type: String, default: 'B.Tech in Computer Science' },
  year:        { type: String, default: '2023 – 2027' },
  email:       { type: String, default: 'ujjwal@example.com' },
  resumeUrl:   { type: String, default: '' },
  photoUrl:    { type: String, default: '/assets/images/profile.png' },
  social: {
    github:    { type: String, default: 'https://github.com/bytewiz_ujjwal' },
    linkedin:  { type: String, default: 'https://linkedin.com/in/bytewiz_ujjwal' },
    twitter:   { type: String, default: 'https://twitter.com/bytewiz_ujjwal' },
    instagram: { type: String, default: 'https://instagram.com/bytewiz_ujjwal' },
  },
  codingProfiles: {
    leetcode:   { type: String, default: 'bytewiz_ujjwal' },
    codeforces: { type: String, default: 'bytewiz_ujjwal' },
    codechef:   { type: String, default: 'bytewiz_ujjwal' },
    gfg:        { type: String, default: 'bytewiz_ujjwal' },
    github:     { type: String, default: 'bytewiz_ujjwal' },
  },
  quickStats: {
    type: [{ label: String, value: String, icon: String }],
    default: [
      { label: 'Problems Solved', value: '1500+', icon: 'code' },
      { label: 'Projects Built',  value: '20+',   icon: 'rocket' },
      { label: 'Certifications',  value: '10+',   icon: 'certificate' },
      { label: 'Contests',        value: '75+',   icon: 'trophy' },
    ],
  },
  interests: {
    type: [String],
    default: ['Competitive Programming 🧠','Open Source 🌐','Problem Solving 🔍','Web Development 🕸️','Machine Learning 🤖','Tech Blogging ✍️','Gaming 🎮','Music 🎵'],
  },
  dsaTopics: {
    type: [{ topic: String, count: Number }],
    default: [
      { topic: 'Arrays', count: 354 },{ topic: 'HashMap & Set', count: 229 },
      { topic: 'String', count: 219 },{ topic: 'Math', count: 178 },
      { topic: 'Sorting', count: 149 },{ topic: 'Greedy Algorithms', count: 141 },
      { topic: 'Dynamic Programming', count: 185 },{ topic: 'DFS', count: 98 },
      { topic: 'Binary Search', count: 112 },{ topic: 'Tree', count: 92 },
      { topic: 'Graph', count: 78 },{ topic: 'Two Pointers', count: 92 },
    ],
  },
  skills: {
    type: Object,
    default: {
      languages: [
        { name: 'C', level: 88 },
        { name: 'C++', level: 95 },
        { name: 'Python', level: 85 },
        { name: 'JavaScript', level: 90 },
      ],
      frameworks: [
        { name: 'ReactJS', level: 90 },
        { name: 'NodeJS', level: 88 },
        { name: 'ExpressJS', level: 85 },
        { name: 'Tailwind CSS', level: 88 },
      ],
      databases: [
        { name: 'MongoDB', level: 88 },
        { name: 'MySQL', level: 85 },
        { name: 'Optimized SQL Queries', level: 85 },
      ],
      tools: [
        { name: 'VSCode', level: 92 },
        { name: 'Git and GitHub', level: 90 },
        { name: 'Jupyter Notebooks', level: 82 },
        { name: 'MySQL Workbench', level: 84 },
      ],
      coursework: [
        { name: 'DSA', level: 95 },
        { name: 'Object Oriented Programming', level: 90 },
        { name: 'Operating Systems', level: 88 },
        { name: 'DBMS', level: 88 },
      ],
      interests: ['DSA', 'Web Development', 'Machine Learning'],
      softSkills: ['Problem Solving', 'Team Leadership', 'Critical Thinking', 'Technical Communication', 'System Design'],
    },
  },
}, { timestamps: true });

export default mongoose.model('Profile', ProfileSchema);
