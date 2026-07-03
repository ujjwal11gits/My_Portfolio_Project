/**
 * SEED SCRIPT — Populates Portfolio_DB with Ujjwal Kumar Choubey's official resume data
 * Usage: node seed.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Profile from './models/Profile.js';
import Project from './models/Project.js';
import { Education, Experience } from './models/Education.js';
import { Achievement, Extracurricular } from './models/Achievement.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database with official resume data...');

  // Clear existing data
  await Promise.all([
    Profile.deleteMany(),
    Project.deleteMany(),
    Education.deleteMany(),
    Experience.deleteMany(),
    Achievement.deleteMany(),
    Extracurricular.deleteMany(),
  ]);

  // ── 1. PROFILE ──
  await Profile.create({
    name: 'Ujjwal Choubey',
    username: 'ujjwal11gits',
    bio: 'Final Year B.Tech CSE student at National Institute of Technology Patna with a strong foundation in Data Structures, Algorithms, Full-Stack Web Development, and AI. Passionate about architecting high-performance web applications, data-driven analytics platforms, and solving complex algorithmic problems.',
    email: 'ujjwal11.work@gmail.com',
    location: 'Patna, Bihar, India',
    institute: 'National Institute of Technology Patna',
    degree: 'B.Tech — Computer Science & Engineering',
    year: '2023 – 2027',
    photoUrl: '/assets/images/profile.png',
    resumeUrl: 'https://drive.google.com/file/d/1BnZfqZSGfknYCVApsknJo9PyQZjvBYXV/view',
    socialLinks: {
      github: 'https://github.com/ujjwal11gits',
      linkedin: 'https://www.linkedin.com/in/ujjwalkumarchoubey',
      twitter: '',
      instagram: '',
    },
    codingProfiles: {
      leetcode: 'bytewiz__ujjwal',
      codeforces: 'bytewiz_ujjwal',
      codechef: 'byte_wizard11',
      geeksforgeeks: 'bytewiz_ujjwal',
      github: 'ujjwal11gits',
    },
    quickStats: {
      contests: 75,
      projectsCount: 20,
      solvedProblems: 1500,
      leetcodeRating: 1750,
      codeforcesRank: 'Pupil',
      codechefStars: '2-Star',
    },
    skills: [
      { name: 'C / C++', level: 92, category: 'Languages' },
      { name: 'JavaScript', level: 88, category: 'Languages' },
      { name: 'Python', level: 82, category: 'Languages' },
      { name: 'React.js', level: 90, category: 'Web' },
      { name: 'Node.js & Express', level: 86, category: 'Web' },
      { name: 'MongoDB', level: 85, category: 'Database' },
      { name: 'MySQL', level: 82, category: 'Database' },
      { name: 'Tailwind CSS / CSS3', level: 88, category: 'Web' },
      { name: 'Data Structures & Algo', level: 94, category: 'Core' },
      { name: 'Operating Systems & DBMS', level: 85, category: 'Core' },
      { name: 'Git & GitHub', level: 90, category: 'Tools' },
    ],
  });
  console.log('✅ Profile seeded');

  // ── 2. EDUCATION ──
  await Education.insertMany([
    {
      type: 'University',
      institution: 'National Institute of Technology Patna',
      degree: 'Bachelor of Technology in Computer Science and Engineering',
      duration: '2023 – 2027',
      grade: 'CGPA: 8.20 / 10',
      highlights: ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Object Oriented Programming'],
      icon: '🎓',
      order: 0,
    },
    {
      type: 'Intermediate (12th)',
      institution: 'Daroga PD Rai College',
      degree: 'Senior Secondary Education (BSEB)',
      duration: '2021 – 2022',
      grade: 'Percentage: 88%',
      highlights: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
      icon: '🏫',
      order: 1,
    },
    {
      type: 'High School (10th)',
      institution: 'Global International School',
      degree: 'Secondary Education (CBSE)',
      duration: '2019 – 2020',
      grade: 'Percentage: 87%',
      highlights: ['Mathematics', 'Science', 'English', 'Social Science'],
      icon: '📚',
      order: 2,
    },
  ]);
  console.log('✅ Education seeded');

  // ── 3. PROJECTS ──
  await Project.insertMany([
    {
      title: 'Balor — Smart Grooming & Salon Marketplace',
      tagline: 'Multi-role booking marketplace with customized workflows for 4 user types.',
      description: 'Architected a multi-role booking marketplace with customized dashboards and workflows for four distinct user types (Customers, Barbers, Salon Owners, and Admins). Engineered secure authentication flows including JWT sessions, cookies, and an automated email OTP verification system with Nodemailer. Optimized database relationships in MongoDB and secured backend APIs with CORS, Helmet, and Express Rate Limiters.',
      tech: ['React.js', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'CSS3', 'Vite', 'Nodemailer'],
      github: 'https://github.com/ujjwal11gits/Balor-Smart_Grooming_and_Salon_Platform',
      repoName: 'ujjwal11gits/Balor-Smart_Grooming_and_Salon_Platform',
      live: 'https://balor.ujjwalchoubey.me',
      image: '/assets/images/balor_cover.png',
      logo: '',
      category: 'Web Dev',
      featured: true,
      features: [
        'Multi-Role Dashboards: Customized workflows & access levels for Customers, Barbers, Salon Owners & Admins',
        'Advanced Authentication: JWT sessions, cookies, and automated email OTP verification with Nodemailer',
        'Mobile-First UX: Responsive frontend featuring multi-select service filtering & quick-booking drawer',
        'Backend Security: CORS policies, Helmet security headers & Express Rate Limiters against brute-force attacks',
        'Database Optimization: High-performance MongoDB schema design & RESTful endpoints'
      ],
      upvotes: 24,
      order: 0,
    },
    {
      title: 'StudManage — Student Performance Management System',
      tagline: 'Data-Driven Web Platform for tracking student programming performance via Codeforces API.',
      description: 'Full-stack analytics platform built to monitor and evaluate student programming performance using Codeforces API integrations. Designed leaderboards, inactivity detection systems, automated email notifications, and performance trend visualizations. Automated periodic data synchronization using cron jobs and enabled CSV data exports for academic review.',
      tech: ['React.js', 'Node.js', 'Express', 'Codeforces API', 'MongoDB', 'Cron Jobs', 'Chart.js'],
      github: 'https://github.com/ujjwal11gits/StudManage',
      repoName: 'ujjwal11gits/StudManage',
      live: '#',
      image: '/assets/images/studmanage_cover.png',
      logo: '',
      category: 'Web Dev',
      featured: false,
      features: [
        'Full-stack analytics platform integrating Codeforces API for live coding metrics',
        'Interactive Leaderboards & Inactivity Detection System for student tracking',
        'Automated Email Notifications & performance trend visualizations',
        'Cron job automation for periodic data synchronization & reporting',
        'CSV-based data export supporting academic review & administrative reporting'
      ],
      upvotes: 18,
      order: 1,
    },
    {
      title: 'CP & DSA Problem Solving Engine',
      tagline: '1500+ Competitive Programming & DSA solutions in C++.',
      description: 'Comprehensive repository of optimized algorithms, data structures implementations, fast I/O contest templates, and verified benchmarks across LeetCode, Codeforces, and CodeChef.',
      tech: ['C++', 'Algorithms', 'DSA', 'Competitive Programming'],
      github: 'https://github.com/ujjwal11gits',
      repoName: 'ujjwal11gits/CP-DSA-Solutions',
      live: '#',
      category: 'DSA',
      featured: false,
      features: [
        '1500+ Solved DSA problems with optimal time & space complexity',
        'Fast I/O template engine for time-critical competitive programming contests',
        'Graph, Dynamic Programming, and Tree algorithm reference implementations',
        'Verified contest performance across 75+ contests on LeetCode & Codeforces'
      ],
      upvotes: 31,
      order: 2,
    },
  ]);
  console.log('✅ Projects seeded');

  // ── 4. ACHIEVEMENTS & CERTIFICATIONS ──
  await Achievement.insertMany([
    {
      name: '1500+ DSA & Competitive Programming Problems',
      issuer: 'LeetCode / Codeforces / CodeChef',
      date: '2024 - 2026',
      type: 'milestone',
      description: 'Solved over 1500 algorithmic challenges with optimized time & space complexities.',
      order: 0,
    },
    {
      name: '75+ Contests Participated',
      issuer: 'LeetCode & Codeforces',
      date: '2024 - 2026',
      type: 'milestone',
      description: 'Achieved 1750+ LeetCode Rating, Codeforces Pupil Rank, and CodeChef 2-Star.',
      order: 1,
    },
    {
      name: 'Top Performer in Annual Hackathons',
      issuer: 'NIT Patna',
      date: '2025',
      type: 'hackathon',
      description: 'Secured top ranking in annual hackathons for building innovative full-stack solutions.',
      order: 2,
    },
    {
      name: 'Winter Internship at IIT Ropar',
      issuer: 'IIT Ropar',
      date: 'Winter 2025',
      type: 'certification',
      description: 'Successfully completed research & development winter internship at IIT Ropar.',
      order: 3,
    },
    {
      name: 'Gold Certificate — Human Computer Interaction',
      issuer: 'NPTEL',
      date: '2025',
      type: 'certification',
      description: 'Earned NPTEL Gold Certificate in Human Computer Interaction course.',
      order: 4,
    },
    {
      name: 'Gold + Elite Certificate — The Joy of Computing using Python',
      issuer: 'NPTEL',
      date: '2024',
      type: 'certification',
      description: 'Earned NPTEL Gold + Elite Certificate in Joy of Computing using Python.',
      order: 5,
    },
  ]);
  console.log('✅ Achievements seeded');

  // ── 5. POSITIONS OF RESPONSIBILITY / EXTRACURRICULARS ──
  await Extracurricular.insertMany([
    {
      title: 'Event Coordinator at GYB',
      organization: 'GYB Society, NIT Patna',
      description: 'Organized technical events, workshops, and managed event execution teams.',
      icon: '🎯',
      order: 0,
    },
    {
      title: 'Technical Lead at GYB',
      organization: 'GYB Society, NIT Patna',
      description: 'Led technical development initiatives, code reviews, and mentored junior developers.',
      icon: '💻',
      order: 1,
    },
  ]);
  console.log('✅ Extracurriculars seeded');

  console.log('\n🎉 Database seeded successfully with Ujjwal Kumar Choubey official resume data!');
  mongoose.disconnect();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
