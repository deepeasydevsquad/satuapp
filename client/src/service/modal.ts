

import api from "./api";

export const dataModalApi = async (param : any) => {
  try {
    const response = await api.post("/modal/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data laporan modal:", error);
    throw error;
  }
};
