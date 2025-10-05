import api from "./api";

export const daftarKostumer = async () => {
  try {
    const response = await api.get("/daftar-paket-la/get-daftar-kostumer");
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil kostumer:", error);
    throw error;
  }
}

export const daftarPaketLA = async (param : any) => {
  try {
    const response = await api.post("/daftar-paket-la/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil paket la:", error);
    throw error;
  }
};

export const addPaketLA = async (param : any) => {
  try {
    const response = await api.post("/daftar-paket-la/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan paket la:", error);
    throw error;
  }
};

export const editPaketLA = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar-paket-la/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit paket la:", error);
    throw error;
  }
};

export const deletePaketLA = async (id : number) => {
  try {
    const response = await api.post(`/daftar-paket-la/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus paket la:", error);
    throw error;
  }
};
