import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import {
  verifyAdminPassword, updateProfile,
  createProject, updateProject, deleteProject,
  createEducation, deleteEducation,
  createAchievement, deleteAchievement,
  getAllPortfolio
} from '../utils/api';
import {
  FiLock, FiUnlock, FiSave, FiPlus, FiTrash2, FiEdit2,
  FiUser, FiFolder, FiBook, FiAward, FiBarChart2, FiExternalLink, FiLogOut
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

export default function Admin() {
  const { data: portfolioData, setData: setPortfolioData } = usePortfolio();

  // Authentication state
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode]           = useState('');
  const [verifying, setVerifying]         = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile');

  // Form states for Profile
  const [profileForm, setProfileForm] = useState({});

  // Projects state & editing
  const [projectsList, setProjectsList] = useState([]);
  const [projectModal, setProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectFormData, setProjectFormData] = useState({
    title: '', category: 'Web Dev', description: '', image: '', tech: '', github: '', live: '', featured: false,
  });

  // Education state & adding
  const [educationList, setEducationList] = useState([]);
  const [eduFormData, setEduFormData]     = useState({
    degree: '', institution: '', duration: '', type: 'University', grade: '', highlights: '',
  });

  // Achievements state & adding
  const [achievementsList, setAchievementsList] = useState([]);
  const [achFormData, setAchFormData]         = useState({
    name: '', issuer: '', date: '', type: 'certification', link: '', description: '', position: '',
  });

  // Check existing session
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (isAuth === 'true') setAuthenticated(true);
  }, []);

  // Sync data from PortfolioContext
  useEffect(() => {
    if (portfolioData) {
      if (portfolioData.profile) setProfileForm(portfolioData.profile);
      if (portfolioData.projects) setProjectsList(portfolioData.projects);
      if (portfolioData.education) setEducationList(portfolioData.education);
      if (portfolioData.achievements) setAchievementsList(portfolioData.achievements);
    }
  }, [portfolioData]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passcode) return toast.error('Please enter Admin passcode');

    setVerifying(true);
    try {
      const res = await verifyAdminPassword(passcode);
      if (res.data?.success) {
        sessionStorage.setItem('admin_authenticated', 'true');
        setAuthenticated(true);
        toast.success('Welcome to Admin Command Center!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Passcode');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setAuthenticated(false);
    toast.success('Logged out of Admin');
  };

  const refreshGlobalData = async () => {
    try {
      const res = await getAllPortfolio();
      setPortfolioData(res.data.data);
    } catch (e) { console.error('Failed refreshing context:', e); }
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    toast.loading('Saving profile data...', { id: 'save-profile' });
    try {
      const res = await updateProfile(profileForm);
      if (res.data?.success) {
        toast.success('Profile updated successfully!', { id: 'save-profile' });
        await refreshGlobalData();
      }
    } catch (err) {
      toast.error('Failed updating profile', { id: 'save-profile' });
    }
  };

  // Create or Update Project
  const handleSaveProject = async (e) => {
    e.preventDefault();
    const payload = {
      ...projectFormData,
      tech: typeof projectFormData.tech === 'string'
        ? projectFormData.tech.split(',').map(s => s.trim()).filter(Boolean)
        : projectFormData.tech,
      features: typeof projectFormData.features === 'string'
        ? projectFormData.features.split('\n').map(s => s.trim()).filter(Boolean)
        : projectFormData.features,
    };

    toast.loading('Saving project...', { id: 'save-proj' });
    try {
      if (editingProject) {
        await updateProject(editingProject._id, payload);
        toast.success('Project updated!', { id: 'save-proj' });
      } else {
        await createProject(payload);
        toast.success('Project created!', { id: 'save-proj' });
      }
      setProjectModal(false);
      setEditingProject(null);
      await refreshGlobalData();
    } catch (err) {
      toast.error('Failed saving project', { id: 'save-proj' });
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted!');
      await refreshGlobalData();
    } catch (err) { toast.error('Failed deleting project'); }
  };

  // Education Add & Delete
  const handleAddEducation = async (e) => {
    e.preventDefault();
    const payload = {
      ...eduFormData,
      highlights: typeof eduFormData.highlights === 'string'
        ? eduFormData.highlights.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };
    try {
      await createEducation(payload);
      toast.success('Education entry added!');
      setEduFormData({ degree: '', institution: '', duration: '', type: 'University', grade: '', highlights: '' });
      await refreshGlobalData();
    } catch (err) { toast.error('Failed adding education'); }
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      await deleteEducation(id);
      toast.success('Education entry removed');
      await refreshGlobalData();
    } catch (err) { toast.error('Failed deleting education'); }
  };

  // Achievement Add & Delete
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try {
      await createAchievement(achFormData);
      toast.success('Achievement entry added!');
      setAchFormData({ name: '', issuer: '', date: '', type: 'certification', link: '', description: '', position: '' });
      await refreshGlobalData();
    } catch (err) { toast.error('Failed adding achievement'); }
  };

  const handleDeleteAchievement = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await deleteAchievement(id);
      toast.success('Achievement deleted');
      await refreshGlobalData();
    } catch (err) { toast.error('Failed deleting achievement'); }
  };

  /* ═════════════════════════════════════════════════════════════
     PASSCODE LOGIN SCREEN
  ═════════════════════════════════════════════════════════════ */
  if (!authenticated) {
    return (
      <div className="admin-login-page page">
        <div className="orb orb-violet" style={{ width: 400, height: 400, top: '20%', left: '30%', opacity: 0.5 }} />

        <div className="admin-login-card glass-card">
          <div className="admin-lock-icon"><FiLock /></div>
          <h2>Admin Command Center</h2>
          <p>Enter your secret passcode to manage your portfolio</p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="input-group">
              <input
                type="password"
                placeholder="Enter Admin Passcode..."
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={verifying}>
              {verifying ? 'Verifying...' : 'Unlock Admin Panel'} <FiUnlock />
            </button>
          </form>

          <span className="passcode-hint mono">Default passcode: ujjwal2026</span>
        </div>
      </div>
    );
  }

  /* ═════════════════════════════════════════════════════════════
     ADMIN DASHBOARD INTERFACE
  ═════════════════════════════════════════════════════════════ */
  return (
    <div className="admin-dashboard-page page">
      <div className="container">

        {/* Admin Header */}
        <div className="admin-header glass-card">
          <div className="admin-header-left">
            <h2>⚡ Admin Command Center</h2>
            <span className="admin-status-badge">
              <span className="pulse-green-dot" /> Authenticated
            </span>
          </div>

          <div className="admin-header-actions">
            <a href="/" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
              View Live Site <FiExternalLink />
            </a>
            <button className="btn btn-outline btn-sm logout-btn" onClick={handleLogout}>
              Logout <FiLogOut />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <FiUser /> Profile & Handles
          </button>
          <button className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
            <FiFolder /> Projects ({projectsList.length})
          </button>
          <button className={`admin-tab ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>
            <FiBook /> Education ({educationList.length})
          </button>
          <button className={`admin-tab ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
            <FiAward /> Achievements ({achievementsList.length})
          </button>
        </div>

        {/* ── TAB 1: PROFILE & HANDLES ── */}
        {activeTab === 'profile' && (
          <motion.div className="admin-panel-content glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="panel-header">
              <h3>Edit Profile Information</h3>
              <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>
                <FiSave /> Save Profile Changes
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="admin-form">

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.name || ''}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Display Username *</label>
                  <input
                    type="text"
                    value={profileForm.username || ''}
                    onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Bio Paragraph</label>
                <textarea
                  rows="3"
                  value={profileForm.bio || ''}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
              </div>

              <div className="form-row grid-3">
                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email || ''}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input
                    type="text"
                    value={profileForm.location || ''}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Institute / College</label>
                  <input
                    type="text"
                    value={profileForm.institute || ''}
                    onChange={e => setProfileForm({ ...profileForm, institute: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Degree Name</label>
                  <input
                    type="text"
                    value={profileForm.degree || ''}
                    onChange={e => setProfileForm({ ...profileForm, degree: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Academic Years (e.g. 2023 - 2027)</label>
                  <input
                    type="text"
                    value={profileForm.year || ''}
                    onChange={e => setProfileForm({ ...profileForm, year: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Profile Photo URL</label>
                  <input
                    type="text"
                    placeholder="/assets/images/profile.png or image link"
                    value={profileForm.photoUrl || ''}
                    onChange={e => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Resume PDF Link</label>
                  <input
                    type="text"
                    placeholder="Drive/Dropbox link or /assets/resume.pdf"
                    value={profileForm.resumeUrl || ''}
                    onChange={e => setProfileForm({ ...profileForm, resumeUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Coding Usernames Section */}
              <div className="admin-section-divider">
                <h4>💻 Coding Usernames (Live Platform Sync)</h4>
              </div>

              <div className="form-row grid-3">
                <div className="form-field">
                  <label>LeetCode Username</label>
                  <input
                    type="text"
                    value={profileForm.codingProfiles?.leetcode || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      codingProfiles: { ...profileForm.codingProfiles, leetcode: e.target.value }
                    })}
                  />
                </div>

                <div className="form-field">
                  <label>Codeforces Username</label>
                  <input
                    type="text"
                    value={profileForm.codingProfiles?.codeforces || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      codingProfiles: { ...profileForm.codingProfiles, codeforces: e.target.value }
                    })}
                  />
                </div>

                <div className="form-field">
                  <label>CodeChef Username</label>
                  <input
                    type="text"
                    value={profileForm.codingProfiles?.codechef || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      codingProfiles: { ...profileForm.codingProfiles, codechef: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>GeeksForGeeks Username</label>
                  <input
                    type="text"
                    value={profileForm.codingProfiles?.gfg || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      codingProfiles: { ...profileForm.codingProfiles, gfg: e.target.value }
                    })}
                  />
                </div>
                <div className="form-field">
                  <label>GitHub Username</label>
                  <input
                    type="text"
                    value={profileForm.codingProfiles?.github || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      codingProfiles: { ...profileForm.codingProfiles, github: e.target.value }
                    })}
                  />
                </div>
              </div>

              {/* Social URLs */}
              <div className="admin-section-divider">
                <h4>🌐 Social Media Links</h4>
              </div>

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>GitHub Profile Link</label>
                  <input
                    type="text"
                    value={profileForm.social?.github || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, github: e.target.value }
                    })}
                  />
                </div>
                <div className="form-field">
                  <label>LinkedIn Profile Link</label>
                  <input
                    type="text"
                    value={profileForm.social?.linkedin || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, linkedin: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Twitter / X Link</label>
                  <input
                    type="text"
                    value={profileForm.social?.twitter || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, twitter: e.target.value }
                    })}
                  />
                </div>
                <div className="form-field">
                  <label>Instagram Link</label>
                  <input
                    type="text"
                    value={profileForm.social?.instagram || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, instagram: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary">
                  <FiSave /> Save All Profile Changes
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* ── TAB 2: PROJECTS MANAGER ── */}
        {activeTab === 'projects' && (
          <motion.div className="admin-panel-content glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="panel-header">
              <h3>Manage Projects ({projectsList.length})</h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setEditingProject(null);
                  setProjectFormData({ title: '', category: 'Web Dev', description: '', image: '', tech: '', github: '', live: '', featured: false });
                  setProjectModal(true);
                }}
              >
                <FiPlus /> Add New Project
              </button>
            </div>

            <div className="admin-items-list">
              {projectsList.map(project => (
                <div key={project._id} className="admin-item-card">
                  <div className="admin-item-info">
                    <span className="item-badge">{project.category}</span>
                    <h4>{project.title} {project.featured && '⭐'}</h4>
                    <p>{project.description}</p>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setEditingProject(project);
                        setProjectFormData({
                          title: project.title,
                          category: project.category || 'Web Dev',
                          description: project.description || '',
                          image: project.image || '',
                          tech: Array.isArray(project.tech) ? project.tech.join(', ') : project.tech || '',
                          github: project.github || '',
                          live: project.live || '',
                          featured: !!project.featured,
                        });
                        setProjectModal(true);
                      }}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteProject(project._id)}>
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: EDUCATION MANAGER ── */}
        {activeTab === 'education' && (
          <motion.div className="admin-panel-content glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="panel-header">
              <h3>Add Education Entry</h3>
            </div>

            <form onSubmit={handleAddEducation} className="admin-form" style={{ marginBottom: 36 }}>
              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Degree / Certificate Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="B.Tech in Computer Science"
                    value={eduFormData.degree}
                    onChange={e => setEduFormData({ ...eduFormData, degree: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Institution / College Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="University Name"
                    value={eduFormData.institution}
                    onChange={e => setEduFormData({ ...eduFormData, institution: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row grid-3">
                <div className="form-field">
                  <label>Duration (e.g. 2023 - 2027)</label>
                  <input
                    type="text"
                    placeholder="2023 - 2027"
                    value={eduFormData.duration}
                    onChange={e => setEduFormData({ ...eduFormData, duration: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Grade / CGPA (e.g. 8.8 CGPA)</label>
                  <input
                    type="text"
                    placeholder="8.8 CGPA"
                    value={eduFormData.grade}
                    onChange={e => setEduFormData({ ...eduFormData, grade: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Highlights (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="DSA, Web Development, DBMS"
                    value={eduFormData.highlights}
                    onChange={e => setEduFormData({ ...eduFormData, highlights: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                <FiPlus /> Add Education
              </button>
            </form>

            <div className="admin-section-divider">
              <h4>Existing Education Entries ({educationList.length})</h4>
            </div>

            <div className="admin-items-list">
              {educationList.map(edu => (
                <div key={edu._id} className="admin-item-card">
                  <div className="admin-item-info">
                    <h4>{edu.degree}</h4>
                    <p>{edu.institution} | {edu.duration} {edu.grade && `| Grade: ${edu.grade}`}</p>
                  </div>
                  <button className="action-btn delete" onClick={() => handleDeleteEducation(edu._id)}>
                    <FiTrash2 /> Remove
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: ACHIEVEMENTS MANAGER ── */}
        {activeTab === 'achievements' && (
          <motion.div className="admin-panel-content glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="panel-header">
              <h3>Add Achievement / Certification</h3>
            </div>

            <form onSubmit={handleAddAchievement} className="admin-form" style={{ marginBottom: 36 }}>
              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Title / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="AWS Certified Cloud Practitioner"
                    value={achFormData.name}
                    onChange={e => setAchFormData({ ...achFormData, name: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Type</label>
                  <select
                    value={achFormData.type}
                    onChange={e => setAchFormData({ ...achFormData, type: e.target.value })}
                  >
                    <option value="certification">Certification</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="award">Award / Contest</option>
                  </select>
                </div>
              </div>

              <div className="form-row grid-3">
                <div className="form-field">
                  <label>Issuer / Organization</label>
                  <input
                    type="text"
                    placeholder="Coursera / Amazon"
                    value={achFormData.issuer}
                    onChange={e => setAchFormData({ ...achFormData, issuer: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Date / Year</label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={achFormData.date}
                    onChange={e => setAchFormData({ ...achFormData, date: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Verification Link</label>
                  <input
                    type="text"
                    placeholder="https://credential.link"
                    value={achFormData.link}
                    onChange={e => setAchFormData({ ...achFormData, link: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Description / Rank Position</label>
                <input
                  type="text"
                  placeholder="Rank 1 / Built automated portal"
                  value={achFormData.description}
                  onChange={e => setAchFormData({ ...achFormData, description: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                <FiPlus /> Add Achievement
              </button>
            </form>

            <div className="admin-section-divider">
              <h4>Existing Achievements ({achievementsList.length})</h4>
            </div>

            <div className="admin-items-list">
              {achievementsList.map(ach => (
                <div key={ach._id} className="admin-item-card">
                  <div className="admin-item-info">
                    <span className="item-badge">{ach.type}</span>
                    <h4>{ach.name}</h4>
                    <p>{ach.issuer} ({ach.date}) {ach.description && `- ${ach.description}`}</p>
                  </div>
                  <button className="action-btn delete" onClick={() => handleDeleteAchievement(ach._id)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* ── MODAL: ADD / EDIT PROJECT ── */}
      <AnimatePresence>
        {projectModal && (
          <div className="modal-overlay">
            <motion.div className="modal-card glass-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="modal-header">
                <h3>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
                <button className="close-btn" onClick={() => setProjectModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSaveProject} className="admin-form">
                <div className="form-row grid-2">
                  <div className="form-field">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      required
                      value={projectFormData.title}
                      onChange={e => setProjectFormData({ ...projectFormData, title: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <select
                      value={projectFormData.category}
                      onChange={e => setProjectFormData({ ...projectFormData, category: e.target.value })}
                    >
                      <option value="Web Dev">Web Dev</option>
                      <option value="ML/AI">ML/AI</option>
                      <option value="DSA">DSA</option>
                      <option value="App">App</option>
                      <option value="CLI">CLI</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Description *</label>
                  <textarea
                    rows="3"
                    required
                    value={projectFormData.description}
                    onChange={e => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Tech Stack (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, MongoDB, TailwindCSS"
                    value={projectFormData.tech}
                    onChange={e => setProjectFormData({ ...projectFormData, tech: e.target.value })}
                  />
                </div>

                <div className="form-row grid-2">
                  <div className="form-field">
                    <label>GitHub Repository Link</label>
                    <input
                      type="text"
                      placeholder="https://github.com/username/repo"
                      value={projectFormData.github}
                      onChange={e => setProjectFormData({ ...projectFormData, github: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Live Demo Link</label>
                    <input
                      type="text"
                      placeholder="https://myproject.vercel.app"
                      value={projectFormData.live}
                      onChange={e => setProjectFormData({ ...projectFormData, live: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row grid-2">
                  <div className="form-field">
                    <label>Image Thumbnail URL</label>
                    <input
                      type="text"
                      placeholder="/assets/images/project.png or image link"
                      value={projectFormData.image}
                      onChange={e => setProjectFormData({ ...projectFormData, image: e.target.value })}
                    />
                  </div>

                  <div className="form-field checkbox-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={projectFormData.featured}
                        onChange={e => setProjectFormData({ ...projectFormData, featured: e.target.checked })}
                      />
                      <span>Feature this project in Hero spotlight ⭐</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setProjectModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <FiSave /> {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
