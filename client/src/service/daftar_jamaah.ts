import api from './api' // Import service API

export const getAgen =  async (division_id: number) => {
  try {
    const response = await api.post('/daftar-jamaah/get-agen', {division_id})
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}

export const getInfoMember = async (param: any) => {
  try {
    const response = await api.post('/daftar-jamaah/get-info-member', param)
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}

export const getMemberNotJamaah = async (division_id: number) => {
  try {
    const response = await api.post('/daftar-jamaah/get-member-not-jamaah', {division_id})
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}

export const getJamaahNotMember = async (division_id: number) => {
  try {
    const response = await api.post('/daftar-jamaah/get-jamaah-not-member', {division_id})
    return response.data
  } catch (error) {
    console.error('Gagal Mengambil Data:', error)
    throw error
  }
}

export const daftarJamaah = async (param: any) => {
  try {
    const response = await api.post('/daftar-jamaah/list', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data jamaah:', error)
    throw error
  }
}

export const getDownloadJamaah = async (division_id: number) => {
  try {
    const response = await api.post('/daftar-jamaah/download', { division_id }, {
      responseType: 'blob', // << penting biar axios handle sebagai file
    })

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `daftar_jamaah.xlsx`) // Nama file
    document.body.appendChild(link)
    link.click()

    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Gagal download data jamaah:', error)
    throw error
  }
}

export const addJamaah = async (param: any) => {
  try {
    const response = await api.post('/daftar-jamaah/add', param, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Gagal menambah data jamaah:', error)
    throw error
  }
}

export const getInfoUpdate = async (param: any) => {
  try {
    const response = await api.post('/daftar-jamaah/get-info-update', param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil data jamaah:', error)
    throw error
  }
}

export const editJamaah = async (param: any) => {
  try {
    const response = await api.post('/daftar-jamaah/update', param, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('gagal update data jamaah', error)
    throw error
  }
}

export const deleteJamaah = async (param: any) => {
  try {
    const response = await api.post('/daftar-jamaah/delete', param)
    return response.data
  } catch (error) {
    console.error('gagal delete data jamaah', error)
    throw error
  }
}
