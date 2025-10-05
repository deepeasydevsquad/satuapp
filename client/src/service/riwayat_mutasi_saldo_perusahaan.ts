import api from './api'; // Import service API

export const list = async (param: any) => {
  try {
    const response = await api.post('/riwayat_mutasi_saldo_perusahaan/list', param);
    return response.data;
  } catch (error) {
    console.error('Gagal:', error);
    throw error;
  }
};

// export const list_bank_transfer = async () => {
//   try {
//     const response = await api.get('/riwayat_tambah_saldo_perusahaan/list_bank_transfer');
//     return response.data;
//   } catch (error) {
//     console.error('Gagal:', error);
//     throw error;
//   }
// };

// export const add_deposit = async (param: any) => {
//   try {
//     const response = await api.post('/riwayat_tambah_saldo_perusahaan/add_deposit', param);
//     return response.data;
//   } catch (error) {
//     console.error('Gagal menambahkan deposit:', error);
//     throw error;
//   }
// };

// export const get_info_edit = async (param: any) => {
//   try {
//     const response = await api.post('/riwayat_tambah_saldo_perusahaan/get_info_edit', param);
//     return response.data;
//   } catch (error) {
//     console.error('Gagal mendapatkan info edit:', error);
//     throw error;
//   }
// };

// export const update_deposit = async (param: any) => {
//   try {
//     const response = await api.post('/riwayat_tambah_saldo_perusahaan/update_deposit', param);
//     return response.data;
//   } catch (error) {
//     console.error('Gagal mengupdate deposit:', error);
//     throw error;
//   }
// };

// export const delete_deposit = async (param: any) => {
//   try {
//     const response = await api.post('/riwayat_tambah_saldo_perusahaan/delete', param);
//     return response.data;
//   } catch (error) {
//     console.error('Gagal menghapus deposit:', error);
//     throw error;
//   }
// };

// export const sudah_dikirim = async (param: any) => {
//   try {
//     const response = await api.post('/riwayat_tambah_saldo_perusahaan/sudah_dikirim', param);
//     return response.data;
//   } catch (error) {
//     console.error('Gagal mengonfirmasi pengiriman:', error);
//     throw error;
//   }
// };
