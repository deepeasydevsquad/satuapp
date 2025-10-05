import api from "./api";

export const daftarProvinsi = async () => {
  try {
    const response = await api.get("/get-provinsi");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarKabupaten = async (param: any) => {
  try {
    const response = await api.post("/get-kabupaten", param);
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarKecamatan = async (param: any) => {
  try {
    const response = await api.post("/get-kecamatan", param);
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarKelurahan = async (param: any) => {
  try {
    const response = await api.post("/get-kelurahan", param);
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarMahram = async () => {
  try {
    const response = await api.get("/get-mahram");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarPekerjaan = async () => {
  try {
    const response = await api.get("/get-pekerjaan");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarPendidikan = async () => {
  try {
    const response = await api.get("/get-pendidikan");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarPengalaman = async () => {
  try {
    const response = await api.get("/get-pengalaman");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarKota = async () => {
  try {
    const response = await api.get("/get-kota");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarAirlines = async () => {
  try {
    const response = await api.get("/get-airlines");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarAsuransi = async () => {
  try {
    const response = await api.get("/get-asuransi");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarHotel = async () => {
  try {
    const response = await api.get("/get-hotel");
    console.log("response", response);
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarBandara = async () => {
  try {
    const response = await api.get("/get-bandara");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarTipePaket = async () => {
  try {
    const response = await api.get("/get-tipe-paket");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarFasilitas = async () => {
  try {
    const response = await api.get("/get-fasilitas");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const daftarProviderVisa = async () => {
  try {
    const response = await api.get("/get-provider-visa");
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};
