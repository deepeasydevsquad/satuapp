import axios from 'axios';
import { API_URL } from '@/config/config';

// Gunakan variabel lingkungan dari .env
const API_BASE_URL = API_URL;

console.log('API_base_url');
console.log(API_BASE_URL);
console.log('API_base_url');

// Base URL API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fungsi untuk mengambil token dari localStorage
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

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

// **Interceptor untuk menangani refresh token jika token kadaluarsa**
let isRefreshing = false;
let failedRequestsQueue = [];

api.interceptors.response.use(
  (response) => response, // Jika response sukses, langsung kembalikan
  async (error) => {
    const originalRequest = error.config;

    console.log('Status:', error.response?.status);

    if (error.response?.status === 404) {
      // window.location.href = '/Login' // Redirect ke halaman login jika refresh gagal
    } else if (error.response?.status === 403) {
      // melakukan refresh
      window.location.href = '/Login';
    } else if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          failedRequestsQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('access_token', newAccessToken);

        // Ulangi semua request yang tertunda dengan token baru
        failedRequestsQueue.forEach((callback) => callback(newAccessToken));
        failedRequestsQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token gagal, harap login ulang');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; // Redirect ke halaman login jika refresh gagal
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
