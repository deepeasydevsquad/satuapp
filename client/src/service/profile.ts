import api from './api'

export const getProfile = async () => {
  try {
    const response = await api.get('/profile')
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data profil:', error)
    throw error
  }
}

export const updateProfile = async (dataToUpdate: any) => {
  try {
    const response = await api.put('/profile', dataToUpdate)
    return response.data
  } catch (error) {
    console.error('Gagal memperbarui data profil:', error)
    throw error
  }
}

export const changePassword = async (passwordData: any) => {
  try {
    const response = await api.put('/profile/change-password', passwordData)
    return response.data
  } catch (error) {
    console.error('Gagal mengubah password:', error)
    throw error
  }
}
