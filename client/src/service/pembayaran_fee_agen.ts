import api from "./api"; // Import service API

export const daftar_agen = async (param : any) => {
  try {
    const response = await api.post("/pembayaran_fee_agen/data_agen", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil data Agen:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const daftar_fee = async (param : any) => {
  try {
    const response = await api.post("/pembayaran_fee_agen/daftar_fee_by_id", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil data fee:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const daftar_pembayaran = async (param : any) => {
  try {
    const response = await api.post("/pembayaran_fee_agen/daftar_pembayaran_fee_agen", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil data fee:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
}

export const detail_fee = async (param : any) => {
  try {
    const response = await api.post("/pembayaran_fee_agen/detail_pembayaran_fee", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil data fee:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
}

export const add_pembayaran_fee = async (param : any) => {
  try {
    const response = await api.post("/pembayaran_fee_agen/add_pembayaran_fee", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil data fee:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
}