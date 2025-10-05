import api from "./api"; // Import service API

export const daftarKota = async (param : any) => {
  try {
    const response = await api.post("/daftar-kota/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil kota:", error);
    throw error;
  }
};

export const addKota = async (param : any) => {
  try {
    const response = await api.post("/daftar-kota/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan kota:", error);
    throw error;
  }
};

export const editKota = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar-kota/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit kota:", error);
    throw error;
  }
};

export const deleteKota = async (id : number) => {
  try {
    const response = await api.post(`/daftar-kota/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus kota:", error);
    throw error;
  }
};
