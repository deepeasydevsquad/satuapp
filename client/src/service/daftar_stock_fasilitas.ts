//
import api from "./api"; // Import service API

export const daftarFasilitasStock = async (param : any) => {
  try {
    const response = await api.post("/daftar-stock-fasilitas/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data stock fasilitas:", error);
    throw error;
  }
};

export const add_stock = async (param : any) => {
  try {
    const response = await api.post("/daftar-stock-fasilitas/add", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data stock fasilitas:", error);
    throw error;
  }
};


export const get_sumber_dana = async (param: any) => {
  try {
    const response = await api.post("/sumber-dana/list",param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data sumber dana:", error);
    throw error;
  }
};

// export const addAirlines = async (param : any) => {
//   try {
//     const response = await api.post("/airlines/add", param);
//     return response.data;
//   } catch (error) {
//     console.error("Gagal menambahkan airlines:", error);
//     throw error;
//   }
// };

// export const editAirlines = async (id : any, param : any) => {
//   try {
//     const response = await api.post(`/airlines/update` , {...param,...{id : id }});
//     return response.data;
//   } catch (error) {
//     console.error("Gagal mengedit airlines:", error);
//     throw error;
//   }
// };

// export const deleteAirlines = async (id : number) => {
//   try {
//     const response = await api.post(`/airlines/delete`,{ id : id});
//     return response.data;
//   } catch (error) {
//     console.error("Gagal menghapus airlines:", error);
//     throw error;
//   }
// };
