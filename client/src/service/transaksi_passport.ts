import api from './api'
interface TransaksiPassportPayload {
  [key: string]: any
}

export const getDaftarTransaksiPassport = async (param: any) => {
  try {
    const response = await api.post(`/daftar-transaksi-passport/get-transaksi-passport/list`, param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil daftar transaksi passport:', error)
    throw error
  }
}

export const daftar_kostumer = async () => {
  try {
    const response = await api.get(`/transaksi-passport/daftar-kostumer`, )
    return response.data
  } catch (error) {
    console.error('Gagal mengambil daftar transaksi passport:', error)
    throw error
  }
}

export const daftar_paket = async (param: any) => {
  try {
    const response = await api.post(`/transaksi-passport/daftar-paket`, param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil daftar transaksi passport:', error)
    throw error
  }
}

export const getCityList = async () => {
  try {
    const response = await api.get('/transaksi-passport/get-all-cities')
    return response.data.data || []
  } catch (error) {
    console.error('Gagal mengambil daftar kota:', error)
    return []
  }
}

export const addTransaksiPassport = async (payload: TransaksiPassportPayload) => {
  try {
    const response = await api.post('/daftar-transaksi-passport/add-new', payload)
    return response.data
  } catch (error) {
    console.error('Gagal menambah transaksi passport:', error)
    throw error
  }
}

export const deleteTransaksiPassport = async (id: number) => {
  try {
    console.log('Deleting transaksi passport with ID:', id)
    const response = await api.delete(`/daftar-transaksi-passport/delete/${id}`)
    console.log('Delete API response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Delete service error:', error)
    return {
      error: true,
      error_msg:
        error.response?.data?.message ||
        error.response?.data?.error_msg ||
        error.message ||
        'Gagal menghubungi server.',
    }
  }
}
