import api from "./api";

export const getPetugasJamaahPaket = async (param : any) => {
  try {
    const response = await api.post("/daftar-jamaah-paket/get-petugas-jamaah-paket", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data petugas jamaah paket: ", error);
    throw error;
  }
}

export const cetakDataJamaahPaket = async (id: number, petugasId: string) => {
  try {
    const response = await api.get(`/daftar-jamaah-paket/cetak-data-jamaah/${id}/cetak?petugasId=${petugasId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil cetak data jamaah:", error);
    throw error;
  }
};

export const daftarJamaahPaket = async (param : any) => {
  try {
    const response = await api.post("/daftar-jamaah-paket/get-daftar-jamaah-paket/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar jamaah paket:", error);
    throw error;
  }
};

export const getHandoverFasilitas = async (id: number) => {
  try {
    const response = await api.post("/daftar-jamaah-paket/get-handover-fasilitas", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar handover fasilitas:", error);
    throw error;
  }
};

export const getMstFasilitas = async (id: number) => {
  try {
    const response = await api.post("/daftar-jamaah-paket/get-mst-fasilitas/list", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar fasilitas handover:", error);
    throw error;
  }
};

export const addHandoverFasilitas = async (param : any) => {
  try {
    const response = await api.post("/daftar-jamaah-paket/add-handover-fasilitas", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan handover fasilitas:", error);
    throw error;
  }
};

export const addHandoverBarangPaket = async (param: any) => {
  try {
    const response = await api.post("/daftar-jamaah-paket/add-handover-barang", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan handover barang:", error);
    throw error;
  }
};

export const pengembalianHandoverBarang = async (param: any) => {
  try {
    const response = await api.post("/daftar-jamaah-paket/pengembalian-handover-barang", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan pengembalian handover barang:", error);
    throw error;
  }
};

export const getInfoPengembalianBarang = async (id: number) => {
  try {
    const response = await api.post("/daftar-jamaah-paket/get-info-pengembalian-handover-barang", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar handover barang:", error);
    throw error;
  }
};

export const cetakDataAbsensiJamaahPaket = async (paketId: number, petugasId: string) => {
  try {
    const response = await api.get(`/daftar-jamaah-paket/absensi-jamaah-paket/${paketId}/cetak?petugasId=${petugasId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil cetak data jamaah:", error);
    throw error;
  }
};
