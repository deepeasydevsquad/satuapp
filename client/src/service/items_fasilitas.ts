import api from "./api";

export const list = async (param : any) => {
  try {
    const response = await api.post("/item_fasilitas/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil jenis mobil:", error);
    throw error;
  }
};

export const hapus = async (param : any) => {
  try {
    const response = await api.post("/item_fasilitas/delete", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil jenis mobil:", error);
    throw error;
  }
};
