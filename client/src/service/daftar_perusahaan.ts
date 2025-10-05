import api from './api_backbone';

export const list = async (param: { search: string; perpage: number; pageNumber: number }) => {
  try {
    const response = await api.post('/backbone/daftar_perusahaan/list', param);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const add_perusahaan = async (param: any) => {
  try {
    const response = await api.post('/backbone/daftar_perusahaan/add', param);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const update_perusahaan = async (param: any) => {
  try {
    const response = await api.post('/backbone/daftar_perusahaan/update', param);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deletes = async (param: any) => {
  try {
    const response = await api.post('/backbone/daftar_perusahaan/delete', param);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const get_data_edit_perusahaan = async (param: any) => {
  try {
    const response = await api.post('/backbone/daftar_perusahaan/get_data_edit_perusahaan', param);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tambah_waktu_berlangganan = async (param: any) => {
  try {
    const response = await api.post('/backbone/daftar_perusahaan/add_waktu_berlangganan', param);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const tambah_saldo = async (param: any) => {
  try {
    const response = await api.post('/backbone/daftar_perusahaan/tambah_saldo', param);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
