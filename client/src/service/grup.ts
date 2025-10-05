import api from './api'

export const daftarMenu = async (param: any) => {
  try {
    const response = await api.get('grup/get-menu', param)
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Menu', error)
    throw error
  }
}

export const daftarGrup = async () => {
  try {
    const response = await api.post('grup/get-grup')
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Grup', error)
    throw error
  }
}

export const addGrup = async (param: any) => {
  try {
    const response = await api.post('grup/add-grup', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan grup:', error)
    throw error
  }
}

export const editGrup = async (param: any) => {
  try {
    const response = await api.put('grup/update-grup', param)
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan grup:', error)
    throw error
  }
}

export const hapusGrup = async (id: any) => {
  try {
    const response = await api.post(`/grup/delete-grup`, { id: id })
    return response.data
  } catch (error) {
    console.error('Gagal menambahkan grup:', error)
    throw error
  }
}
