import api from "./api"; // Import service API

export const daftarBank = async () => {
  try {
    const response = await api.get("/supplier/get-bank");
    return response.data;
  } catch (error) {
    console.error("Gagal menampilkan bank:", error);
    throw error;
  }
};

export const daftarSupplier = async (param : any) => {
  try {
    const response = await api.post("/supplier/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menampilkan supplier:", error);
    throw error;
  }
};

export const addSupplier = async (param : any) => {
  try {
    const response = await api.post("/supplier/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan supplier:", error);
    throw error;
  }
};

export const editSupplier = async (id : any, param : any) => {
  try {
    const response = await api.post(`/supplier/update`, {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit supplier:", error);
    throw error;
  }
};

export const deleteSupplier = async (id : number) => {
  try {
    const response = await api.post(`/supplier/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus supplier:", error);
    throw error;
  }
};
