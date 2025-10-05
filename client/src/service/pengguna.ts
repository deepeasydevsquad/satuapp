import api from './api' // Import service API


export const getMember = async () => {
  try {
    const response = await api.get("/pengguna/get-member");
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data member:", error);
    throw error;
  }
}

export const getGrup = async () => {
  try {
    const response = await api.get("/pengguna/get-grup");
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data cabang:", error);
    throw error;
  }
}

export const daftarPengguna = async (param: any) => {
  try {
    const response = await api.get('/pengguna/get-pengguna', param)
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menambahkan pengguna:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const addPengguna = async (param: any) => {
  try {
    const response = await api.post('/pengguna/add-pengguna', param) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menambahkan pengguna:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const editPengguna = async (param: any) => {
  try {
    const response = await api.post('/pengguna/edit-pengguna', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan grup:', error)
    throw error
  }
}

export const deletePengguna = async (id: number) => {
  try {
    const response = await api.post('/pengguna/delete-pengguna', { id }) // Kirim data ke backend dengan benar
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menghapus pengguna:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const getInfoEditPengguna = async (id: number) => {
    try {
    const response = await api.post('/pengguna/get-info-edit-pengguna', { id }) // Kirim data ke backend dengan benar
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal menghapus pengguna:', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

// deleteHotel
