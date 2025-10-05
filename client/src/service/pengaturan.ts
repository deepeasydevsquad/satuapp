import api from './api' // Import service API

export const getPengaturan = async (param: any) => {
  try {
    const response = await api.post('/company', param, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menambahkan kota:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const updatePengaturan = async (param: any) => {
  try {
    const response = await api.put(
      `/update`, // ID dimasukkan dalam URL
      param, // Tidak perlu kirim ID di body jika backend tidak membutuhkannya
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui cabang:', error)
    throw error
  }
}

// deleteKota
