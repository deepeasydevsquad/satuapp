import api from './api' // Import service API


export const getRiwayatSurat = async () => {
  try {
    const response = await api.post('/daftar_surat_menyurat/get_riwayat_surat')
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}

export const getKonfigurasi = async () => {
  try {
    const response = await api.post('/daftar_surat_menyurat/get_konfigurasi_surat')
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}

export const addKonfigurasi = async (data : any) => {
  try {
    const response = await api.post('/daftar_surat_menyurat/add_konfigurasi_surat', data)
    return response.data
  } catch (error) {
    console.error('Gagal Mengirim Data:', error)
    throw error
  }
}

export const get_jamaah = async () => {
  try {
    const response = await api.get('/daftar_surat_menyurat/get_jamaah_surat')
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}

export const add_surat = async (data : any) => {
  try {
    const response = await api.post('/daftar_surat_menyurat/add_surat', data)
    return response.data
  } catch (error) {
    console.error('Gagal Mengirim Data:', error)
    throw error
  }
}

export const cetak_surat = async (jenis_surat: string, data: any) => {
  try {
    const response = await api.post(`/cetak_surat/${jenis_surat}`, data)
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}

export const deleteSurat = async ( data: any) => {
  try {
    const response = await api.post('/daftar_surat_menyurat/delete_surat', data)
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}