import api from './api' // Import service API

export const daftarAgen = async (param: any) => {
  try {
    const response = await api.post('/agen/list', param)
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal ambil Agen:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const addAgen = async (param: any) => {
  try {
    const response = await api.post('/addAgen', param) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal Addd Agen:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const deleteAgen = async (id: number) => {
  try {
    const response = await api.post('/agen/deleteAgen', { id }) // Kirim data ke backend dengan benar
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menghapus Agen:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}
