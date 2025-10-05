import axios from 'axios';
import { API_URL } from '@/config/config';
// API_URL
// Gunakan variabel lingkungan dari .env
const API_BASE_URL = API_URL;

// Base URL API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fungsi untuk mengambil token dari localStorage
const getAccessToken = () => localStorage.getItem('access_token_backbone');
const getRefreshToken = () => localStorage.getItem('refresh_token_backbone');

// Tambahkan interceptor untuk menyisipkan token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor untuk response: refresh token jika expired
let isRefreshing = false;
let failedRequestsQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_BASE_URL}/auth-backbone/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('access_token_backbone', newAccessToken);

        // Jalankan semua request yang tertunda
        failedRequestsQueue.forEach((cb) => cb(newAccessToken));
        failedRequestsQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token gagal, harap login ulang');
        localStorage.removeItem('access_token_backbone');
        localStorage.removeItem('refresh_token_backbone');
        window.location.href = '/backbone-login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
