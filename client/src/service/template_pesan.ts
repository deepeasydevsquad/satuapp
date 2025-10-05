import api from "./api";

export const daftar_template = async (param: any) => {
    try {
      const response = await api.post('/template-pesan-whatsapp/list',  param );
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil kwitansi terakhir tabungan umrah:", error);
      throw error;
    }
  }

  export const get_template_by_id = async (param: any) => {
    try {
      const response = await api.post('/template-pesan-whatsapp/by-id',  param );
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil kwitansi terakhir tabungan umrah:", error);
      throw error;
    }
  }

  export const add_template = async (param: any) => {
    try {
      const response = await api.post('/template-pesan-whatsapp/add-template-pesan-whatsapp',  param );
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil kwitansi terakhir tabungan umrah:", error);
      throw error;
    }
  }

  export const update_template = async (param: any) => {
    try {
      const response = await api.post('/template-pesan-whatsapp/update-template-pesan-whatsapp',  param );
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil kwitansi terakhir tabungan umrah:", error);
      throw error;
    }
  }

  export const delete_template = async (param: any) => {
    try {
      const response = await api.post('/template-pesan-whatsapp/delete-template-pesan-whatsapp',  param );
      return response.data;
    } catch (error) {
      console.error("Gagal mengambil kwitansi terakhir tabungan umrah:", error);
      throw error;
    }
  }