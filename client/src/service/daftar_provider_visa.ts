import api from "./api";

export const daftarProviderVisa = async (param : any) => {
  try {
    const response = await api.post("/daftar-provider-visa/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil provider visa:", error);
    throw error;
  }
};

export const addProviderVisa = async (param : any) => {
  try {
    const response = await api.post("/daftar-provider-visa/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan provider visa:", error);
    throw error;
  }
};

export const editProviderVisa = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar-provider-visa/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit provider visa:", error);
    throw error;
  }
};

export const deleteProviderVisa = async (id : number) => {
  try {
    const response = await api.post(`/daftar-provider-visa/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus provider visa:", error);
    throw error;
  }
};
