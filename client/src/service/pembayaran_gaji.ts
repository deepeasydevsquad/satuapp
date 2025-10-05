import api from './api' // Import service API

export const daftar_pembayaran_gaji = async (param: any) => {
  try {
    const response = await api.post('/pembayaran_gaji/daftar_pembayaran_gaji', param)
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal ambil Agen:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const add_pembayaran_gaji = async (param: any) => {
  try {
    const response = await api.post('/pembayaran_gaji/add_pembayaran', param) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal Addd gaji:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const daftar_staff_sumber_dana = async(param : any) => {
  try {
    const response = await api.post('/pembayaran_gaji/daftar_staff_sumber_dana', param)
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal ambil stafff:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}



export const delete_pembayaran = async(param : any) => {
  try {
    const response = await api.post('/pembayaran_gaji/delete_pembayaran', param)
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal ambil stafff:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}
