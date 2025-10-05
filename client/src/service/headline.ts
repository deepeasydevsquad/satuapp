import api from './api';

export const getDaftarHeadline = async (param: any) => {
  try {
    const response = await api.post('/headline/daftar-headline', param);
    return response.data;
  } catch (error) {
    console.error('Error fetching Daftar Headline:', error);
    throw error;
  }
}

export const addHeadline = async (param : any) => {
  try {
    const response = await api.post("/headline/add-headline", param);
    return response.data;
  } catch (error) {
    console.error("Gagal menambahkan headline:", error);
    throw error;
  }
};

export const fetchHeadline = async (id: number) => {
  try {
    const response = await api.post(`/headline/fetch-headline/`, { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data headline:", error);
    throw error;
  }
};

export const updateHeadline = async (param: any) => {
  try {
    const response = await api.post("/headline/update-headline", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengupdate headline:", error);
    throw error;
  }
};

export const deleteHeadline = async (id : number) => {
  try {
    const response = await api.post("/headline/delete-headline", {id : id});
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus headline:", error);
    throw error;
  }
};
