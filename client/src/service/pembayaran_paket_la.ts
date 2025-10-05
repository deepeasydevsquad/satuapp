import api from "./api"; // Import service API

export const getItemTransaksi = async (param : any) => {
  try {
    const response = await api.post("/pembayaran_paket_la/list", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil data fasilitas paket la:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const addPembayaranPaketLa = async (param : any) => {
  try {
    const response = await api.post("/pembayaran_paket_la", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal menambahkan fasilitas paket la:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};
