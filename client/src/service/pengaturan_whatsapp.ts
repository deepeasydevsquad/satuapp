import api from './api' // Import service API


export const check_koneksi = async (param: any) => {
    try {
      const response = await api.post('/check_koneksi', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal cek koneksi:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }


  export const get_key = async (param: any) => {
    try {
      const response = await api.post('/get_key', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal cek koneksi:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }


  export const update_pengaturan = async (param: any) => {
    try {
      const response = await api.post('/update_pengaturan_whatsapp', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal cek koneksi:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }

