import api from "./api";

export const daftarJenisMobil = async (param : any) => {
  try {
    const response = await api.post("/daftar-mobil/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil jenis mobil:", error);
    throw error;
  }
};

export const addJenisMobil = async (param : any) => {
  try {
    const response = await api.post("/daftar-mobil/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan jenis mobil:", error);
    throw error;
  }
};

export const editJenisMobil = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar-mobil/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit jenis mobil:", error);
    throw error;
  }
};

export const deleteJenisMobil = async (id : number) => {
  try {
    const response = await api.post(`/daftar-mobil/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus jenis mobil:", error);
    throw error;
  }
};
