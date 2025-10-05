import api from "./api";


export const getJamaah = async (param: any) => {
  try {
    const response = await api.post(`/daftar-transaksi-paket/get-jamaah-transaksi-paket/list/`, param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar jamaah:", error);
    throw error;
  }
};

export const getPaketTypes = async (id: number) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/get-paket-types-transaksi-paket/list", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar paket types:", error);
    throw error;
  }
};

export const getAgen = async (id: number) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/get-agen-transaksi-paket", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar agen:", error);
    throw error;
  }
};

export const daftarTransaksiPaket = async (param : any) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/get-daftar-transaksi-paket/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar transaksi paket:", error);
    throw error;
  }
};

export const addTransaksiPaket = async (param : any) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/add-transaksi-paket", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambah transaksi paket:", error);
    throw error;
  }
};

export const updateVisaTransaksiPaket = async (param: any) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/update-visa-transaksi-paket", param);
    return response.data;
  } catch (error) {
    console.error("Gagal melakukan update visa transaksi paket:", error);
    throw error;
  }
};

export const infoupdateVisaTransaksiPaket = async (param: any) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/get-info-update-visa-transaksi-paket", param);
    return response.data;
  } catch (error) {
    console.error("Gagal melakukan update visa transaksi paket:", error);
    throw error;
  }
}

export const refundTransaksiPaket = async (param: any) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/refund-transaksi-paket", param);
    return response.data;
  } catch (error) {
    console.error("Gagal melakukan refund transaksi paket:", error);
    throw error;
  }
};

export const inforefundTransaksiPaket = async (param: any) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/get-info-refund-transaksi-paket", param);
    return response.data;
  } catch (error) {
    console.error("Gagal melakukan refund transaksi paket:", error);
    throw error;
  }
}

export const deleteTransaksiPaket = async (param: any) => {
  try {
    const response = await api.post("/daftar-transaksi-paket/delete-transaksi-paket", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus transaksi paket:", error);
    throw error;
  }
};
