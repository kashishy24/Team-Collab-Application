import axios from 'axios';

const TOKEN_KEY = 'teamcollab_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateMe: (data) => api.put('/api/auth/me', data),
  createTeam: (data) => api.post('/api/auth/teams', data),
  getMembers: () => api.get('/api/auth/teams/members'),
  updateMemberRole: (userId, role) => api.patch(`/api/auth/teams/members/${userId}/role`, { role }),
};

export const projectsApi = {
  list: () => api.get('/api/projects'),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  remove: (id) => api.delete(`/api/projects/${id}`),
};

export const tasksApi = {
  list: (projectId) => api.get('/api/tasks', { params: { projectId } }),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data),
  remove: (id) => api.delete(`/api/tasks/${id}`),
};

export const messagesApi = {
  list: (teamId) => api.get('/api/messages', { params: { teamId } }),
  send: (data) => api.post('/api/messages', data),
};

export const assistantApi = {
  command: (command, projectId) => api.post('/api/assistant', { command, projectId }),
};

export default api;
