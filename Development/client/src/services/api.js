// Create new file: client/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Task API methods
export const taskService = {
  // Get all tasks
  getAllTasks: () => api.get('/tasks'),
  
  // Get single task
  getTask: (id) => api.get(`/tasks/${id}`),
  
  // Create task
  createTask: (taskData) => api.post('/tasks', taskData),
  
  // Update task
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  
  // Delete task
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// Auth API methods
export const authService = {
  // Register
  register: (userData) => axios.post(`${API_URL}/auth/register`, userData),
  
  // Login
  login: (userData) => axios.post(`${API_URL}/auth/login`, userData),
  
  // Logout (client-side only - clears token)
  logout: () => localStorage.removeItem('token'),
};

export default api;