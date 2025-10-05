import api from "./api"; // Import service API

export const daftarBandara = async (param : any) => {
  try {
    const response = await api.post("/daftar-bandara/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil bandara:", error);
    throw error;
  }
};

export const addBandara = async (param : any) => {
  try {
    const response = await api.post("/daftar-bandara/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan bandara:", error);
    throw error;
  }
};

export const editBandara = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar-bandara/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit bandara:", error);
    throw error;
  }
};

export const deleteBandara = async (id : number) => {
  try {
    const response = await api.post(`/daftar-bandara/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus bandara:", error);
    throw error;
  }
};
