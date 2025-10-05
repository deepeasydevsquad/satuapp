import api from './api';

export const getDaftarPaket = async () => {
  try {
    const response = await api.get('/daftar-trans-paket/daftar-paket/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching daftar paket:', error);
    throw error;
  }
};

export const getDaftarJamaahTransPaket = async (param: any) => {
  try {
    const response = await api.post('/daftar-trans-paket/daftar-jamaah/list', param);
    return response.data;
  } catch (error) {
    console.error('Error fetching daftar jamaah trans paket:', error);
    throw error;
  }
};

export const getPetugasJamaahTransPaket = async () => {
  try {
    const response = await api.get('/daftar-trans-paket/get-petugas-jamaah-trans-paket');
    return response.data;
  } catch (error) {
    console.error('Error fetching petugas jamaah trans paket:', error);
    throw error;
  }
};

export const getCetakDataJamaahTransPaket = async (id: number) => {
  try {
    const response = await api.get(`/daftar-trans-paket/cetak-data-jamaah/${id}/cetak`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cetak data jamaah trans paket:', error);
    throw error;
  }
}

export const uploadFilePendukung = async (data: FormData) => {
  console.log(data)
  try {
    const response = await api.post('/daftar-trans-paket/upload-file-pendukung', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file pendukung:', error);
    throw error;
  }
};

