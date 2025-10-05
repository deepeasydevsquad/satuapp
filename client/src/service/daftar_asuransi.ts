import api from "./api";

export const daftarAsuransi = async (param : any) => {
  try {
    const response = await api.post("/daftar-asuransi/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil asuransi:", error);
    throw error;
  }
};

export const addAsuransi = async (param : any) => {
  try {
    const response = await api.post("/daftar-asuransi/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan asuransi:", error);
    throw error;
  }
};

export const editAsuransi = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar-asuransi/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit asuransi:", error);
    throw error;
  }
};

export const deleteAsuransi = async (id : number) => {
  try {
    const response = await api.post(`/daftar-asuransi/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus asuransi:", error);
    throw error;
  }
};
