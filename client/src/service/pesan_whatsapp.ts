import api from "./api"; 
import { paramAkun } from "./param_cabang";


export const get_nomor_company = async (param: any) => {
    try {
      const response = await api.get('/pesan_whatsapp/get_nomor_company', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal mengambil nomor:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }


  export const get_initial_data = async (param: any) => {
    try {
      const response = await api.post('/pesan_whatsapp/get_data', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal mengambil data:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }


  export const get_message = async (param: any) => {
    try {
      const response = await api.post('/pesan_whatsapp/get_message', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal mengambil data:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }


  export const daftar_pesan = async( param : any) => {
    try {
      const response = await api.post('/pesan_whatsapp/daftar_pesan', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal mengambil data:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }


  export const add_pesan = async (param : any) => {
    try {
      const response = await api.post('/pesan_whatsapp/add_pesan', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal menambahkan pesan:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }


  export const delete_pesan = async ( param : any) => {
    try {
      const response = await api.post('/pesan_whatsapp/delete_pesan', param)
      return response.data // Kembalikan data hasil request
    } catch (error) {
      console.error('Gagal menghapus pesan:', error)
      throw error // Bisa ditangani di bagian pemanggilan
    }
  }