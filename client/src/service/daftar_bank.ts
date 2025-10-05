import api from "./api"; // Import service API

export const daftarBank = async (param : any) => {
  try {
    const response = await api.post("/daftar-bank/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil bank:", error);
    throw error;
  }
};

export const addBank = async (param : any) => {
  try {
    const response = await api.post("/daftar-bank/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan bank:", error);
    throw error;
  }
};

export const editBank = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar-bank/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit bank:", error);
    throw error;
  }
};

export const deleteBank = async (id : number) => {
  try {
    const response = await api.post(`/daftar-bank/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus bank:", error);
    throw error;
  }
};
