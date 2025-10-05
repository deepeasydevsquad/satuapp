import api from "./api";

export const getDaftarTransaksiVisa = async (param: any) => {
  try {
    const response = await api.post(`/daftar-transaksi-visa/get-transaksi-visa/list`, param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil daftar transaksi visa:", error);
    throw error;
  }
}

export const addTransaksiVisa = async (payload: TransaksiVisaPayload) => {
  try {
    const response = await api.post('/daftar-transaksi-visa/add-new', payload);
    return response.data;
  } catch (error) {
    console.error("Gagal menambah transaksi visa:", error);
    throw error;
  }
}

export const getCityList = async () => {
  try {
    const response = await api.get('/transaksi-visa/get-all-cities');
    return response.data.data || [];
  } catch (error) {
    console.error("Gagal mengambil daftar kota:", error);
    return [];
  }
};

export const deleteTransaksiVisa = async (id: number) => {
  try {
    console.log('Deleting transaksi visa with ID:', id);
    const response = await api.delete(`/daftar-transaksi-visa/delete/${id}`);
    console.log('Delete API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Delete service error:', error);
    return {
      error: true,
      error_msg: error.response?.data?.message ||
                 error.response?.data?.error_msg ||
                 error.message ||
                 'Gagal menghubungi server.'
    };
  }
};

// Interface untuk TypeScript
interface TransaksiVisaPayload {
  [key: string]: any;
}

export const getVisaTypesList = async () => {
  try {
    const response = await api.get('/transaksi-visa/get-all-visa-types');
    return response.data.data || [];
  } catch (error) {
    console.error("Gagal mengambil daftar jenis visa:", error);
    return [];
  }
};

export const daftar_paket = async (param : any) => {
    try {
        const response = await api.post("/transaksi-visa/daftar-paket", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const daftar_kostumer = async () => {
    try {
        const response = await api.get("/transaksi-visa/daftar-kostumer");
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const get_jenis_visa = async () => {
  try {
      const response = await api.get("/transaksi-visa/daftar-jenis-visa");
      return response.data;
  } catch (error) {
      throw error;
  }
}

export const getSumberDanaPaket = async ( param : { cabang: number} ) => {
  try {
      const response = await api.post("/transaksi-visa/get-sumber-dana-paket", param);
      return response.data;
  } catch (error) {
      throw error;
  }
}

export const addVisaUrl = async ( param : { cabang: number, sumber_dana: number, kostumer: number, paket: number, jenis_visa: number, pax: number, harga_travel: number, harga_costumer: number  } ) => {
  try {
      const response = await api.post("/transaksi-visa/add-visa", param);
      return response.data;
  } catch (error) {
      throw error;
  }
}
