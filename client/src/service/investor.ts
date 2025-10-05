import api from "./api"; // Import service API

export const daftarInvestorAPI = async (param : any) => {
  try {
    const response = await api.post("/investor/list", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil daftar investor:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const infoAdd = async () => {
  try {
    const response = await api.get("/investor/info-add"); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil info add investor:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const infoEdit = async (param : any) => {
  try {
    const response = await api.post("/investor/info-edit", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil info edit investor:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const editInfoAPI = async (param : any) => {
  try {
    const response = await api.post("/investor/editInfo", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil info edit:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const addInvestorAPI = async (param : any) => {
  try {
    const response = await api.post("/investor", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal menambahkan investor:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const editInvestorAPI = async (param : any) => {
  try {
    const response = await api.post(`/investor/update` , param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengedit data investor:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const deleteInvestorAPI = async (id : number) => {
  try {
    const response = await api.post(`/investor/delete`,{ id : id}); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal menghapus investor:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};
// deleteAirlines
