import api from "./api";

export const daftarTransFasilitas = async (params: any) => {
  try {
    const response = await api.post("/trans_fasilitas/daftar_transaksi", params);
    return response.data;
  } catch (error) {
    console.error("Error fetching daftarTransFasilitas:", error);
    throw error;
  }
};

export const add_transaksi = async (params: any) => {
  try {
    const response = await api.post("/trans_fasilitas/add_transaksi", params);
    return response.data;
  } catch (error) {
    console.error("Error adding transaksi:", error);
    throw error;
  }
};

export const delete_transaksi = async (id: number) => {
  try {
    const response = await api.post("/trans_fasilitas/delete_transaksi", { id });
    return response.data;
  } catch (error) {
    console.error("Error deleting transaksi:", error);
    throw error;
  }
};

export const daftar_kostumer = async () => {
    try {
      const response = await api.get("/trans_fasilitas/daftar_customer");
      return response.data;
    } catch (error) {
      throw error;
    }
}

export const daftar_paket = async (param : any) => {
    try {
        const response = await api.post("/trans_fasilitas/daftar_paket", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const daftar_fasilitas = async (param: any) => {
  try {
    const response = await api.post("/trans_fasilitas/daftar_fasilitas", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan tiket:", error);
    throw error;
  }
}
