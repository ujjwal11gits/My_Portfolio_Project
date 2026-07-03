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
        { name: 'C++', level: 90 },{ name: 'Python', level: 80 },
        { name: 'JavaScript', level: 85 },{ name: 'HTML/CSS', level: 90 },
        { name: 'Java', level: 65 },{ name: 'SQL', level: 75 },
      ],
      frameworks: [
        { name: 'React', level: 80 },{ name: 'Node.js', level: 75 },
        { name: 'Express', level: 70 },{ name: 'MongoDB', level: 70 },
        { name: 'TailwindCSS', level: 80 },
      ],
      tools: [
        { name: 'Git', level: 85 },{ name: 'GitHub', level: 85 },
        { name: 'VS Code', level: 90 },{ name: 'Linux', level: 70 },
        { name: 'Docker', level: 55 },
      ],
      softSkills: ['Problem Solving','Team Collaboration','Critical Thinking','Communication','Time Management','Leadership'],
    },
  },
}, { timestamps: true });

export default mongoose.model('Profile', ProfileSchema);
