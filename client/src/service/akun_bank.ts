import api from "./api"; // Import service API

export const list = async (param : any) => {
  try {
    const response = await api.post("/daftar_bank/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil airlines:", error);
    throw error;
  }
};

export const by_id = async (param : any) => {
    try {
      const response = await api.post("/daftar_bank/by_id", param);
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil airlines:", error);
      throw error;
    }
  };

  export const mst_bank = async () => {
    try {
      const response = await api.get("/daftar_bank/mst_bank");
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil airlines:", error);
      throw error;
    }
  };

  export const add = async (param : any) => {
    try {
      const response = await api.post("/daftar_bank/add", param);
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil airlines:", error);
      throw error;
    }
  };



  export const update = async (param : any) => {
    try {
      const response = await api.post("/daftar_bank/update", param);
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil airlines:", error);
      throw error;
    }
  };
  


  export const hapus = async (param : any) => {
    try {
      const response = await api.post("/daftar_bank/delete", param);
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil airlines:", error);
      throw error;
    }
  };