import axios, { AxiosRequestConfig } from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if not already there
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (name: string, email: string, password: string) => 
    api.post('/auth/register', { name, email, password }),
  
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  googleLogin: (idToken: string) => 
    api.post('/auth/google', { idToken }),
  
  getProfile: () => 
    api.get('/auth/profile')
};

// Projects API
export const projectsAPI = {
  getProjects: () => 
    api.get('/projects'),
  
  getProject: (projectId: string) => 
    api.get(`/projects/${projectId}`),
  
  createProject: (title: string, description: string) => 
    api.post('/projects', { title, description }),
  
  updateProject: (projectId: string, title: string, description: string) => 
    api.put(`/projects/${projectId}`, { title, description }),
  
  deleteProject: (projectId: string) => 
    api.delete(`/projects/${projectId}`),
  
  addMember: (projectId: string, email: string, role: string) => 
    api.post(`/projects/${projectId}/members`, { email, role }),
  
  removeMember: (projectId: string, userId: string) => 
    api.delete(`/projects/${projectId}/members/${userId}`),
  
  updateStatuses: (projectId: string, statuses: any[]) => 
    api.put(`/projects/${projectId}/statuses`, { statuses })
};

// Tasks API
export const tasksAPI = {
  getProjectTasks: (projectId: string) => 
    api.get(`/tasks/project/${projectId}`),
  
  getTask: (taskId: string) => 
    api.get(`/tasks/${taskId}`),
  
  createTask: (task: {
    title: string;
    description?: string;
    project: string;
    status?: string;
    assignee?: string;
    dueDate?: Date;
    priority?: string;
  }) => 
    api.post('/tasks', task),
  
  updateTask: (taskId: string, task: {
    title?: string;
    description?: string;
    status?: string;
    assignee?: string;
    dueDate?: Date;
    priority?: string;
  }) => 
    api.put(`/tasks/${taskId}`, task),
  
  deleteTask: (taskId: string) => 
    api.delete(`/tasks/${taskId}`),
  
  updateTaskStatus: (taskId: string, status: string) => 
    api.put(`/tasks/${taskId}/status`, { status }),
  
  addComment: (taskId: string, text: string) => 
    api.post(`/tasks/${taskId}/comments`, { text })
};

// Automations API
export const automationsAPI = {
  getProjectAutomations: (projectId: string) => 
    api.get(`/automations/project/${projectId}`),
  
  createAutomation: (automation: {
    project: string;
    name: string;
    description?: string;
    trigger: {
      type: string;
      conditions: any;
    };
    action: {
      type: string;
      details: any;
    };
  }) => 
    api.post('/automations', automation),
  
  updateAutomation: (automationId: string, automation: {
    name?: string;
    description?: string;
    active?: boolean;
    trigger?: {
      type: string;
      conditions: any;
    };
    action?: {
      type: string;
      details: any;
    };
  }) => 
    api.put(`/automations/${automationId}`, automation),
  
  deleteAutomation: (automationId: string) => 
    api.delete(`/automations/${automationId}`)
};

export default api; 