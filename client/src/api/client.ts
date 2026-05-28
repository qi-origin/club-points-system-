import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const role = window.location.pathname.startsWith('/admin') ? 'admin' : 'student';
      window.location.href = role === 'admin' ? '/admin/login' : '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
