import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// Public endpoints
export const getProfile       = ()         => api.get('/portfolio/profile');
export const updateProfile    = (data)     => api.patch('/portfolio/profile', data);
export const getAllPortfolio   = ()         => api.get('/portfolio/all');
export const getProjects      = ()         => api.get('/portfolio/projects');
export const getEducation     = ()         => api.get('/portfolio/education');
export const getAchievements  = ()         => api.get('/portfolio/achievements');

// Live coding platform proxies
export const getGitHub        = (u)        => api.get(`/github/user/${u}`);
export const getLeetCode      = (u)        => api.get(`/leetcode/stats/${u}`);
export const getCodeforces    = (u)        => api.get(`/codeforces/stats/${u}`);
export const getCodeChef      = (u)        => api.get(`/codechef/stats/${u}`);
export const getGFG           = (u)        => api.get(`/gfg/stats/${u}`);

export const clearCache       = (platform, u) => api.delete(`/${platform}/cache/${u}`);
export const sendContact      = (data)     => api.post('/contact/send', data);

// Admin Auth & CRUD
export const verifyAdminPassword = (password) => api.post('/portfolio/admin/verify', { password });

export const createProject       = (data)     => api.post('/portfolio/projects', data);
export const updateProject       = (id, data) => api.patch(`/portfolio/projects/${id}`, data);
export const upvoteProject       = (id)       => api.post(`/portfolio/projects/${id}/upvote`);
export const deleteProject       = (id)       => api.delete(`/portfolio/projects/${id}`);

export const createEducation     = (data)     => api.post('/portfolio/education', data);
export const updateEducation     = (id, data) => api.patch(`/portfolio/education/${id}`, data);
export const deleteEducation     = (id)       => api.delete(`/portfolio/education/${id}`);

export const createAchievement   = (data)     => api.post('/portfolio/achievements', data);
export const deleteAchievement   = (id)       => api.delete(`/portfolio/achievements/${id}`);

export default api;
