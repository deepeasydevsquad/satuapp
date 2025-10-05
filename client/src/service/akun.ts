import api from "./api"; // Import service API

export const getFilterAkun = async () => {
  try {
    const response = await api.get("/akun/filter_akun");
    return response.data;
  } catch (error : any) {
    console.error("Gagal menambahkan kota:", error);
    throw error;
  }
};

export const getData = async (param : any) => {
  try {
    const response = await api.post("/daftar_akun/", param);
    return response.data;
  } catch (error : any) {
    console.error("Gagal menambahkan kota:", error);
    throw error;
  }
};

export const addAkun = async (param : any) => {
  try {
    const response = await api.post("/daftar_akun/add", param);
    return response.data;
  } catch (error : any) {
    console.error("Gagal menambahkan akun:", error);
    throw error;
  }
};

export const editAkun = async (param : any) => {
  try {
    const response = await api.post("/daftar_akun/edit", param);
    return response.data;
  } catch (error : any) {
    console.error("Gagal memperbaharui akun:", error);
    throw error;
  }
};

export const checkAkun = async (param : any) => {
  try {
    const response = await api.post("/daftar_akun/check_akun", param);
    return response.data;
  } catch (error : any) {
    return error.response.data;
  }
};

export const updateSaldo = async ( param : any ) => {
  try {
    const response = await api.post("/daftar_akun/update_saldo", param);
    return response.data;
  } catch (error : any) {
    return error.response.data;
  }
}

export const deleteAkun = async (param : number) => {
  try {
    const response = await api.post("/daftar_akun/delete", { id : param });
    return response.data;
  } catch (error : any) {
    return error.response.data;
  }
};

export const tutupBuku = async (param : any) => {
  try {
    const response = await api.post("/daftar_akun/tutup_buku", param);
    return response.data;
  } catch (error : any) {
    throw error;
  }
};

export const kembalikanBuku = async () => {
  try {
    const response = await api.get("/daftar_akun/kembalikan_buku");
    return response.data;
  } catch (error : any) {
    throw error;
  }
};
