import api from './api'

export const get_paket_agen = async (param: any) => {
  try {
    const response = await api.post('/trans_paket/get-pembayaran-agen-paket', param)
    return response.data
  } catch (error) {
    console.log('gagal mendapatkan agen paket:', error)
  }
}

export const get_fee_by_agen = async (param: any) => {
  try {
    const response = await api.post('/trans_paket/daftar_fee_by_agen', param)
    return response.data
  } catch (error) {
    console.log('gagal mendapatkan agen paket:', error)
  }
}

export const add_pembayaran = async (param: any) => {
  try {

    console.log("******************");
    console.log(param);
    console.log("******************");
    const response = await api.post('/trans_paket/add_pembayaran_agen', param)
    return response.data
  } catch (error) {
    console.log('gagal membayar agen paket:', error)
  }
}
