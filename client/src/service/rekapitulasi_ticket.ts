import api from "./api";

export const cetakDataRekapTicket = async (regnumb: string) => {
  try {
    const response = await api.get(`/rekapitulasi-ticket/cetak/${regnumb}` );
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data rekapitulasi:", error);
    throw error;
  }
}

export const getTicketTersedia = async (search: string) => {
  try {
    const response = await api.post("/rekapitulasi-ticket/daftar-tiket", { search });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil tiket yang tersedia:", error);
    throw error;
  }
};

export const daftarRekapitulasiTiket = async (params: any) => {
  try {
    const response = await api.post("/rekapitulasi-ticket/daftar-rekapitulasi-ticket", params);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data rekapitulasi:", error);
    throw error;
  }
};

export const addRekapitulasi = async (params: any) => {
  try {
    const response = await api.post("/rekapitulasi-ticket/create", params);
    return response.data;
  } catch (error) {
    console.error("Gagal membuat rekapitulasi:", error);
    throw error;
  }
};

export const deleteRekapitulasi = async (id: number) => {
  try {
    const response = await api.post(`/rekapitulasi-ticket/delete`, {id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus rekapitulasi:", error);
    throw error;
  }
};
