import api from './api'

export const getKwitansi = async (orderId: any) => {
  try {
    const response = await api.get(`/kwitansi/${orderId}`)
    return response.data
  } catch (error) {
    console.log('gagal mendapatkan gwitansi:', error)
  }
}

export const getNotifikasi = async () => {
  try {
    const response = await api.get('/check-midtrans-status')
    return response.data
  } catch (error) {
    console.log('gagal mendapatkan notifikasi:', error)
  }
}
