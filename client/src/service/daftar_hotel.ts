import api from "./api"; // Import service API

export const daftarKota = async () => {
  try {
    const response = await api.get("/daftar-hotel/get-kota");
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar kota:", error)
    throw error;
  }
}
export const daftarHotel = async (param : any) => {
  try {
    const response = await api.post("/daftar-hotel/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil hotel:", error);
    throw error;
  }
};

export const addHotel = async (param : any) => {
  try {
    const response = await api.post("/daftar-hotel/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan hotel:", error);
    throw error;
  }
};

export const editHotel = async (id : any, param : any) => {
  try {
    const response = await api.post(`/daftar-hotel/update` , {...param,...{id : id }});
    return response.data;
  } catch (error) {
    console.error("Gagal mengedit hotel:", error);
    throw error;
  }
};

export const deleteHotel = async (id : number) => {
  try {
    const response = await api.post(`/daftar-hotel/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus hotel:", error);
    throw error;
  }
};
