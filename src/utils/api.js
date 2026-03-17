import axios from 'axios';

const api = axios.create({
  baseURL: 'https://digitallostandfound-backend.onrender.com/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;
  
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default api;
