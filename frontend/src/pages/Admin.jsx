import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import {
  verifyAdminPassword, updateProfile,
  createProject, updateProject, deleteProject,
  createEducation, deleteEducation,
  createAchievement, deleteAchievement,
  createExtracurricular, deleteExtracurricular,
  getAllPortfolio
} from '../utils/api';
import {
  FiLock, FiUnlock, FiSave, FiPlus, FiTrash2, FiEdit2,
  FiUser, FiFolder, FiBook, FiAward, FiBarChart2, FiExternalLink, FiLogOut,
  FiEye, FiEyeOff, FiStar, FiUsers
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatResumeUrl, formatImageUrl } from '../utils/resumeHelper';
import './Admin.css';

export default function Admin() {
  const { data: portfolioData, setData: setPortfolioData } = usePortfolio();

  // Authentication state
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
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
    title: '', category: 'Web Dev', description: '', image: '', tech: '', features: '', github: '', live: '', featured: false,
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

  // Extracurriculars / Positions state & adding
  const [extracurricularsList, setExtracurricularsList] = useState([]);
  const [extraFormData, setExtraFormData]               = useState({
    title: '', organization: '', description: '', icon: '🌟',
  });

  // Check existing session
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated');
    if (isAuth === 'true') setAuthenticated(true);
  }, []);

  // Populate data when loaded
  useEffect(() => {
    if (portfolioData) {
      if (portfolioData.profile) setProfileForm(portfolioData.profile);
      if (portfolioData.projects) setProjectsList(portfolioData.projects);
      if (portfolioData.education) setEducationList(portfolioData.education);
      if (portfolioData.achievements) setAchievementsList(portfolioData.achievements);
      if (portfolioData.extracurriculars) setExtracurricularsList(portfolioData.extracurriculars);
    }
  }, [portfolioData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!passcode) return toast.error('Please enter passcode');

    setVerifying(true);
    try {
      const res = await verifyAdminPassword(passcode);
      if (res.data?.success) {
        sessionStorage.setItem('admin_authenticated', 'true');
        setAuthenticated(true);
        toast.success('Admin Authenticated! Welcome Ujjwal ⚡');
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
      if (setPortfolioData) setPortfolioData(res.data.data);
    } catch (e) { console.error('Failed refreshing context:', e); }
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const formattedProfile = {
      ...profileForm,
      photoUrl: formatImageUrl(profileForm.photoUrl),
      resumeUrl: formatResumeUrl(profileForm.resumeUrl),
    };
    toast.loading('Saving profile data...', { id: 'save-profile' });
    try {
      const res = await updateProfile(formattedProfile);
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
      image: formatImageUrl(projectFormData.image),
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

  // Extracurricular / Position Add & Delete
  const handleAddExtracurricular = async (e) => {
    e.preventDefault();
    try {
      await createExtracurricular(extraFormData);
      toast.success('Position / Extracurricular added!');
      setExtraFormData({ title: '', organization: '', description: '', icon: '🌟' });
      await refreshGlobalData();
    } catch (err) { toast.error('Failed adding position'); }
  };

  const handleDeleteExtracurricular = async (id) => {
    if (!window.confirm('Delete this position?')) return;
    try {
      await deleteExtracurricular(id);
      toast.success('Position removed');
      await refreshGlobalData();
    } catch (err) { toast.error('Failed deleting position'); }
  };

  /* ═════════════════════════════════════════════════════════════
     PASSCODE LOGIN SCREEN (SECURE - NO PASSWORD HINTS)
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
            <div className="input-group password-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Secret Passcode..."
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(p => !p)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={verifying}>
              {verifying ? 'Verifying...' : 'Unlock Admin Panel'} <FiUnlock />
            </button>
          </form>
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
          <button className={`admin-tab ${activeTab === 'positions' ? 'active' : ''}`} onClick={() => setActiveTab('positions')}>
            <FiUsers /> Positions & Leadership ({extracurricularsList.length})
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

              {/* Interests & Soft Skills Section */}
              <div className="admin-section-divider">
                <h4>✨ Interests & Soft Skills</h4>
              </div>

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Interests & Passions (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Competitive Programming, Web Development, Machine Learning"
                    value={Array.isArray(profileForm.interests) ? profileForm.interests.join(', ') : profileForm.interests || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                  />
                </div>
                <div className="form-field">
                  <label>Soft Skills & Competencies (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Problem Solving, Team Leadership, Critical Thinking"
                    value={Array.isArray(profileForm.skills?.softSkills) ? profileForm.skills.softSkills.join(', ') : profileForm.skills?.softSkills || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      skills: {
                        ...(profileForm.skills || {}),
                        softSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    })}
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
                    value={profileForm.social?.github || profileForm.socialLinks?.github || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, github: e.target.value },
                      socialLinks: { ...profileForm.socialLinks, github: e.target.value }
                    })}
                  />
                </div>
                <div className="form-field">
                  <label>LinkedIn Profile Link</label>
                  <input
                    type="text"
                    value={profileForm.social?.linkedin || profileForm.socialLinks?.linkedin || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, linkedin: e.target.value },
                      socialLinks: { ...profileForm.socialLinks, linkedin: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Twitter / X Link</label>
                  <input
                    type="text"
                    value={profileForm.social?.twitter || profileForm.socialLinks?.twitter || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, twitter: e.target.value },
                      socialLinks: { ...profileForm.socialLinks, twitter: e.target.value }
                    })}
                  />
                </div>
                <div className="form-field">
                  <label>Instagram Link</label>
                  <input
                    type="text"
                    value={profileForm.social?.instagram || profileForm.socialLinks?.instagram || ''}
                    onChange={e => setProfileForm({
                      ...profileForm,
                      social: { ...profileForm.social, instagram: e.target.value },
                      socialLinks: { ...profileForm.socialLinks, instagram: e.target.value }
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
                  setProjectFormData({ title: '', category: 'Web Dev', description: '', image: '', tech: '', features: '', github: '', live: '', featured: false });
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
                          features: Array.isArray(project.features) ? project.features.join('\n') : project.features || '',
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

        {/* ── TAB 5: POSITIONS OF RESPONSIBILITY MANAGER ── */}
        {activeTab === 'positions' && (
          <motion.div className="admin-panel-content glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="panel-header">
              <h3>Add Position of Responsibility / Leadership Role</h3>
            </div>

            <form onSubmit={handleAddExtracurricular} className="admin-form" style={{ marginBottom: 36 }}>
              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Role / Position Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Technical Lead / Event Coordinator"
                    value={extraFormData.title}
                    onChange={e => setExtraFormData({ ...extraFormData, title: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Organization / Society Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="GYB Society, NIT Patna"
                    value={extraFormData.organization}
                    onChange={e => setExtraFormData({ ...extraFormData, organization: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row grid-2">
                <div className="form-field">
                  <label>Description / Responsibilities</label>
                  <input
                    type="text"
                    placeholder="Organized technical events and mentored junior developers"
                    value={extraFormData.description}
                    onChange={e => setExtraFormData({ ...extraFormData, description: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Icon Emoji</label>
                  <input
                    type="text"
                    placeholder="🎯 or 💻"
                    value={extraFormData.icon}
                    onChange={e => setExtraFormData({ ...extraFormData, icon: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                <FiPlus /> Add Position
              </button>
            </form>

            <div className="admin-section-divider">
              <h4>Existing Positions & Leadership Roles ({extracurricularsList.length})</h4>
            </div>

            <div className="admin-items-list">
              {extracurricularsList.map(extra => (
                <div key={extra._id} className="admin-item-card">
                  <div className="admin-item-info">
                    <span className="item-badge">{extra.icon || '🌟'}</span>
                    <h4>{extra.title}</h4>
                    <p>{extra.organization} {extra.description && `- ${extra.description}`}</p>
                  </div>
                  <button className="action-btn delete" onClick={() => handleDeleteExtracurricular(extra._id)}>
                    <FiTrash2 /> Remove
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
                <div className="modal-body" style={{ maxHeight: '58vh', overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    <label>Key Features & Architecture Highlights (One bullet point per line)</label>
                    <textarea
                      rows="4"
                      placeholder="Multi-Role Dashboards for 4 user types&#10;Advanced Auth with JWT & OTP&#10;Mobile-First Responsive UX"
                      value={projectFormData.features}
                      onChange={e => setProjectFormData({ ...projectFormData, features: e.target.value })}
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
                      <label>Project Cover Page / Thumbnail URL *</label>
                      <input
                        type="text"
                        required
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
                </div>

                <div className="modal-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
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
