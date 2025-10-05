import api from './api'; // Pastikan path ini benar sesuai konfigurasi axios Anda
import { API_URL } from '@/config/config';
/**
 * Menjalankan proses logout.
 * 1. Mengirim permintaan ke backend untuk menghapus refresh token.
 * 2. Menghapus token dari localStorage di sisi client.
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
      // Kirim permintaan ke server untuk membatalkan refresh token
      const baseUrl = API_URL;

      await api.post(`${baseUrl}/auth/logout`, {
        refresh_token: refreshToken,
      });

      console.log('Logout berhasil di server');
    }
  } catch (error) {
    // Meskipun gagal di server, tetap lanjutkan proses logout di client
    console.error('Gagal saat logout di server, melanjutkan logout di client:', error);
  } finally {
    // Selalu hapus token dari local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Optional: Clear any other user-related data
    localStorage.removeItem('user_info');
    localStorage.removeItem('menu_info');

    console.log('Token berhasil dihapus dari localStorage');
  }
};

/**
 * Mengecek apakah user sedang login (memiliki access token)
 */
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('access_token');
  return !!accessToken;
};

/**
 * Mendapatkan access token dari localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Mendapatkan refresh token dari localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

/**
 * Menyimpan token ke localStorage
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

/**
 * Logout dan redirect ke halaman login
 */
export const logoutAndRedirect = async (redirectPath: string = '/Login'): Promise<void> => {
  await logout();
  window.location.href = redirectPath;
};
