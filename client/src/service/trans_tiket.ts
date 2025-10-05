import api from "./api";

export const deleteUrl = async ( param : { id: number } ) => {
  try {
    const response = await api.post("/trans_tiket/delete", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengupdate tiket:", error);
    throw error;
  }
}

export const editTiketUrl = async ( param : any ) => {
  try {
    const response = await api.post("/trans_tiket/update", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengupdate tiket:", error);
    throw error;
  }
}

export const getInfoPembayaranTicketUrl = async ( param : { id: number } ) => {
  try {
      const response = await api.post("/trans_tiket/get_info_pembayaran_ticket", param);
      return response.data;
  } catch (error) {
      console.error("Gagal menambahkan tiket:", error);
      throw error;
  }
}

export const add_tiket = async (param : any) => {
    console.log(param);
    try {
        const response = await api.post("/trans_tiket/add_tiket", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}
export const get_transactions = async (param: { pageNumber: number, perpage: number, search: string, filter: string, cabang: number }) => {
    try {
      const response = await api.post("/trans_tiket/ticket_transactions", param);
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil tiket transactions:", error);
      throw error;
    }
};

export const generate_nomor_register = async () => {
    try {
        const response = await api.get("/trans_tiket/generate_nomor_register");
        return response.data;
    }
    catch(error) {
        console.error("Gagal mengambil nomor register", error);
        throw error;
    }
}
export const generate_nomor_invoice = async () => {
    try {
        const response = await api.get("/trans_tiket/generate_nomor_invoice");
        return response.data;
    }
    catch(error) {
        console.error("Gagal mengambil nomor invoice", error);
        throw error;
    }
}

export const getAirlines = async (param : { cabang: number } ) => {
  try {
    const response = await api.post("/trans_tiket/get-airlines", param);
    return response.data;
  } catch (error) {
    console.error("error", error);
    throw error;
  }
};

export const addPembayaran = async (param : any) => {
    try {
        const response = await api.post("/trans_tiket/add_pembayaran", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}


export const getDetailUrl = async (param : { id: number }) => {
  try {
      const response = await api.post("/trans_tiket/detail", param);
      return response.data;
  } catch (error) {
      console.error("Gagal mengambil detail tiket:", error);
      throw error;
  }
}

export const detail_refund = async (param : any) => {

  try {
      const response = await api.post("/trans_tiket/detail_refund", param);
      return response.data;
  } catch (error) {
      console.error("Gagal mengambil detail refund:", error);
      throw error;
  }
}

export const refundUrl = async (param : any) => {
  try {
      const response = await api.post("/trans_tiket/refund", param);
      return response.data;
  } catch (error) {
      console.error("Gagal melakukan refund tiket:", error);
      throw error;
  }
}

export const detail_reschedule = async (param : any) => {
  try {
      const response = await api.post("/trans_tiket/detail_reschedule", param);
      return response.data;
  } catch (error) {
      console.error("Gagal mengambil detail reschedule:", error);
      throw error;
  }
}

export const reschedule = async (param : any) => {
  try {
      const response = await api.post("/trans_tiket/reschedule", param);
      return response.data;
  } catch (error) {
      console.error("Gagal melakukan reschedule tiket:", error);
      throw error;
  }
}

export const daftar_paket = async (param : any) => {
  try {
      const response = await api.post("/trans_tiket/daftar_paket", param);
      return response.data;
  } catch (error) {
      console.error("Gagal melakukan reschedule tiket:", error);
      throw error;
  }
}

export const daftar_costumer = async () => {
  try {
      const response = await api.get("/trans_tiket/daftar_customer");
      return response.data;
  } catch (error) {
      console.error("Gagal melakukan reschedule tiket:", error);
      throw error;
  }
}

export const getAirlinesByIdUrl = async (param: { id: number }) => {
  try {
      const response = await api.post("/trans_tiket/airlines_by_id", param);
      return response.data;
  } catch (error) {
      console.error("Gagal melakukan reschedule tiket:", error);
      throw error;
  }
}
