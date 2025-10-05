import api from "./api"; // Import service API

export const daftarAirlines = async (param : any) => {
  try {
    const response = await api.post("/airlines/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil airlines:", error);
    throw error;
  }
};

export const addAirlines = async (param : any) => {
  try {
    const response = await api.post("/airlines/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan airlines:", error);
    throw error;
  }
};

export const editAirlines = async (id : any, param : any) => {
  try {
    const response = await api.post(`/airlines/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit airlines:", error);
    throw error;
  }
};

export const deleteAirlines = async (id : number) => {
  try {
    const response = await api.post(`/airlines/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus airlines:", error);
    throw error;
  }
};
