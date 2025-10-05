import api from './api'

export const get_paket_agen = async (param: any) => {
  try {
    const response = await api.post('/paket/agen', param)
    return response.data
  } catch (error) {
    console.log('gagal mendapatkan gwitansi:', error)
  }
}

