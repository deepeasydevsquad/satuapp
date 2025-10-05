import api from './api' // Import service API

export const daftarCabang = async () => {
  try {
    const response = await api.get('/get-cabang') // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menambahkan kota:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const daftarKota = async () => {
  try {
    const response = await api.get('/ambil-kota');
    return response.data
  } catch (error) {
    console.log('-------------------')
    console.log('data tidak di temukan')
    console.log('-------------------')
  }
}

export const addCabang = async (param: any) => {
  try {
    const response = await api.post('/add-cabang', param, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
    console.log('API Response:', response.data)
  } catch (error) {
    console.error('Gagal menambahkan cabang:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const editCabang = async (id: any, param: any) => {
  try {
    const response = await api.put(`/update-cabang/${id}`, param, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui cabang:', error)
    throw error
  }
}

export const hapusCabang = async (id: number) => {
  try {
    const response = await api.delete(`/delete-cabang/${id}`) // ID di URL, tidak perlu body
    return response.data
  } catch (error) {
    console.error('Gagal menghapus cabang:', error)
    throw error
  }
}

// deleteKota
