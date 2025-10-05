import api from "./api";

export const daftarTipePaket = async (param : any) => {
  try {
    const response = await api.post("/daftar_tipe_paket/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil tipe paket:", error);
    throw error;
  }
};

export const addTipePaket = async (param : any) => {
  try {
    const response = await api.post("/daftar_tipe_paket", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan tipe paket:", error);
    throw error;
  }
};

export const editTipePaket = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar_tipe_paket/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit tipe paket:", error);
    throw error;
  }
};

export const deleteTipePaket = async (id : number) => {
  try {
    const response = await api.post(`/daftar_tipe_paket/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus tipe paket:", error);
    throw error;
  }
};
