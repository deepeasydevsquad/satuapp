import api from './api';

export const daftarSyaratPaket = async (param: any) => {
  try {
    const response = await api.post('/daftar-syarat-paket/get-daftar-manifest-paket/list', param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menampilkan syarat paket:', error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
}
