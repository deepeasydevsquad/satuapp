import api from "./api"; // Import service API

export const daftarFasilitasPaketLA = async (param : any) => {
  try {
    const response = await api.post("/fasilitas_paket_la/list", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil data fasilitas paket la:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const addFasilitasPaketLA = async (param : any) => {
  try {
    const response = await api.post("/fasilitas_paket_la", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal menambahkan fasilitas paket la:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const deleteFasilitasPaketLA = async (itemId : number, fasilitaspaketlaId: number) => {
  try {
    const response = await api.post(`/fasilitas_paket_la/delete`,{itemId, fasilitaspaketlaId}); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal menghapus fasilitas paket la:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};
