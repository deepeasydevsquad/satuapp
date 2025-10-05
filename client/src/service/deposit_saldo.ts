import api from './api' // Import service API

export const daftarDeposit = async (param: any) => {
  try {
    const response = await api.post('/deposit_saldo/get-deposit', param) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal mengambil data deposit', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}
export const dataCompany = async (param: any) => {
  try {
    const response = await api.get('/deposit_saldo/get-company', param) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal mengambil data deposit', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const infoDeposit = async (id: number) => {
  try {
    const response = await api.post('/deposit_saldo/info-deposit', { id }) // Kirim dalam bentuk object!
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data deposit', error)
    throw error
  }
}

export const addDeposit = async (param: any) => {
  try {
    const response = await api.post('/deposit_saldo/add-deposit', param) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menambahkan fasilitas paket la:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const get_member = async (param: any) => {
  try {
    const response = await api.post('/deposit_saldo/get-member', param) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menambahkan fasilitas paket la:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}
