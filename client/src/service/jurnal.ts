import api from "./api";

export const daftarJurnal = async (param : any) => {
  try {
    const response = await api.post("/jurnal/server_side", param);
    return response.data;
  } catch (error) {
    console.error("Gagal:", error);
    throw error;
  }
};

export const deleteJurnal = async (id : number) => {
  try {
    const response = await api.post(`/jurnal/delete`,{ id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal:", error);
    throw error;
  }
};


export const getFilter = async () => {
  try {
    const response = await api.get("/jurnal/filter");
    return response.data;
  } catch (error : any) {
    console.error("Gagal:", error);
    throw error;
  }
};

// export const getFilter = async (id : number) => {
//   try {
//     const response = await api.get(`/daftar_mobil/delete`,{ id : id});
//     return response.data;
//   } catch (error) {
//     console.error("Gagal menambahkan jenis mobil:", error);
//     throw error;
//   }
// };

//
