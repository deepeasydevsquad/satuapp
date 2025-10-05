import api from "./api";

export const cekKwitansiTabunganUmrah = async (invoice: string) => {
  try {
    const response = await api.post(`/invoice/cek-kwitansi-tabungan-umrah`, { invoice });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil kwitansi terakhir tabungan umrah:", error);
    throw error;
  }
};

export const getJamaah = async (division_id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-jamaah-tabungan-umrah/list", {division_id});
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar jamaah:", error);
    throw error;
  }
};

export const getPaket = async (division_id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-paket-tabungan-umrah/list", {division_id});
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar paket:", error);
    throw error;
  }
};

export const getMstFasilitas = async (id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-mst-fasilitas/list", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar fasilitas handover:", error);
    throw error;
  }
};

export const getAgen = async (id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-agen-tabungan-umrah", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar agen:", error);
    throw error;
  }
};

export const getHandoverFasilitas = async (id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-handover-fasilitas", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar handover fasilitas:", error);
    throw error;
  }
};

export const getInfoPengembalianBarang = async (id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-info-pengembalian-handover-barang", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar handover barang:", error);
    throw error;
  }
};

export const getPetugasTabunganUmrah = async (division_id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-petugas-tabungan-umrah", { division_id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar petugas:", error);
    throw error;
  }
};

export const getInfoPaketPembelian = async (id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-info-paket-pembelian", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil info paket pembelian:", error);
    throw error;
  }
}

export const pembelianPaketTabunganUmrah = async (param : any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/pembelian-paket-tabungan-umrah", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan deposit tabungan umrah:", error);
    throw error;
  }
}

export const cetakDataJamaahTabunganUmrah = async (id: number, petugasId: string) => {
  try {
    const response = await api.get(`/daftar-tabungan-umrah/cetak-data-jamaah/${id}/cetak?petugasId=${petugasId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil cetak data jamaah:", error);
    throw error;
  }
};

export const daftar_tabungan_umrah = async (param : any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-tabungan-umrah/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil paket:", error);
    throw error;
  }
};

export const addTabunganUmrah = async (param : any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/add-tabungan-umrah", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan tabungan umrah:", error);
    throw error;
  }
};

export const MenabungTabunganUmrah = async (param : any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/menabung-tabungan-umrah", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan deposit tabungan umrah:", error);
    throw error;
  }
}

export const getInfoMenabungTabunganUmrah = async (id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-info-menabung-tabungan-umrah", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil info menabung tabungan umrah:", error);
    throw error;
  }
}

export const RefundTabunganUmrah = async (param : any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/refund-tabungan-umrah", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan deposit tabungan umrah:", error);
    throw error;
  }
}

export const getInfoRefundTabunganUmrah = async (id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-info-refund-tabungan-umrah", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil info refund tabungan umrah:", error);
    throw error;
  }
}

export const updateTabunganUmrah = async (param : any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/update-target-paket-tabungan-umrah", param);
    return response.data;
  } catch (error) {
    console.error("Gagal update tabungan umrah:", error);
    throw error;
  }
}

export const getInfoUpdateTabunganUmrah = async (id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/get-info-update-tabungan-umrah", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil info update tabungan umrah:", error);
    throw error;
  }
};

export const addHandoverFasilitas = async (param : any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/add-handover-fasilitas", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan handover fasilitas:", error);
    throw error;
  }
}

export const addHandoverBarang = async (param: any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/add-handover-barang", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan handover barang:", error);
    throw error;
  }
}

export const pengembalianHandoverBarang = async (param: any) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/pengembalian-handover-barang", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan pengembalian handover barang:", error);
    throw error;
  }
}

export const deleteTabunganUmrah = async (id : number, division_id: number) => {
  try {
    const response = await api.post("/daftar-tabungan-umrah/delete-tabungan-umrah",{ id : id, division_id : division_id });
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus tabungan umrah:", error);
    throw error;
  }
};
