import api from './api'

export const daftar_produk = async (param : any) => {
  try {
    const response = await api.post('/ppob/daftar_produk', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data profil:', error)
    throw error
  }
}

export const add = async (param : any) => {
  try {
    const response = await api.post('/ppob/add', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data profil:', error)
    throw error
  }
}

export const hapus = async (param : any) => {
  try {
    const response = await api.post('/ppob/delete', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data profil:', error)
    throw error
  }
}

export const riwayat_transaksi = async (param : any) => {
  try {
    const response = await api.post('/ppob/riwayat_transaksi', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data profil:', error)
    throw error
  }
}