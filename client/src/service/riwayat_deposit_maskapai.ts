import api from './api' // Import service API

export const riwayat_deposit_maskapai = async (param: any) => {
  try {
      const response = await api.post('/riwayat_deposit_maskapai/list', param)
      return response.data
  } catch (error) {
      console.error('Gagal Mengambil Data:', error)
      throw error
  }
}

export const get_info_add_deposit = async ( param: any) => {
  try {
      const response = await api.post('/riwayat_deposit_maskapai/add_info', param)
      return response.data
  } catch (error) {
      console.error('Gagal Mengambil Info Tambah Deposit:', error)
      throw error
  }
}

export const add_deposit_maskapai = async (param: any) => {
  try {
      const response = await api.post('/riwayat_deposit_maskapai/add', param)
      return response.data
  } catch (error) {
      console.error('Gagal Menambahkan Deposit Maskapai:', error)
      throw error
  }
}

export const delete_riwayat_deposit_maskapai = async (param: any) => {
  try {
      const response = await api.post('/riwayat_deposit_maskapai/delete', param)
      return response.data
  } catch (error) {
      console.error('Gagal Menghapus Riwayat Deposit Maskapai:', error)
      throw error
  }
}
