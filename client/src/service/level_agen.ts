import api from './api'

export const daftarAgen = async (param: any) => {
  try {
    const response = await api.get('/daftar-level-agen', param)
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Level Agen', error)
    throw error
  }
}

export const addAgen = async (param: any) => {
  try {
    const response = await api.post('/add-level-agen', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan level agen:', error)
    throw error
  }
}

export const editAgen = async (param: any) => {
  try {
    const response = await api.post('/update-level-agen', param)
    return response.data
  } catch (error) {
    console.error('Gagal update level agen:', error)
    throw error
  }
}

export const hapusAgen = async (id: any) => {
  try {
    const response = await api.post('/delete-level-agen', { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menghapus level:', error)
    throw error
  }
}
