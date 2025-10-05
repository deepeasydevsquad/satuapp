import api from './api'

interface KamarPayload {
  hotel_id: number | null
  tipe_kamar: string
  kapasitas_kamar: number
  jamaah_ids: (number | null)[]
}

// Helper untuk menangani respons API yang tidak konsisten
const handleResponse = (response: any) => {
  if (response.data && typeof response.data === 'object') {
    return response.data
  }
  return response
}

export const getDaftarKamarPaket = async (param: any) => {
  try {
    const response = await api.post(`/daftar-kamar-paket/get-kamar-paket/list`, param)
    return handleResponse(response)
  } catch (error) {
    console.error('Gagal mengambil daftar kamar paket:', error)
    throw error
  }
}

export const createKamar = async (payload: KamarPayload) => {
  try {
    const response = await api.post('/daftar-kamar-paket/create-kamar', payload)
    return handleResponse(response)
  } catch (error) {
    console.error('Gagal membuat kamar:', error)
    throw error
  }
}

export const getAllHotels = async (param: any) => {
  try {
    const response = await api.post('/daftar-kamar-paket/get-hotels', param)
    return handleResponse(response)
  } catch (error) {
    console.error('Gagal mengambil data hotel:', error)
    throw error
  }
}


export const getAllJamaah = async (param : any ) => {
  try {
    const response = await api.post('/daftar-kamar-paket/get-available-jamaah', param)
    return handleResponse(response)
  } catch (error) {
    console.error('Gagal mengambil data hotel:', error)
    throw error
  }
}

// export const getAllJamaah = async (param: any) => {
//   const payload = {
//     forEdit: param.forEdit === false ? false : true,
//     currentKamarId: param.currentKamarId,
//     division_id: param.division_id,
//   };

//   try {
//     const url = payload.forEdit ? '/daftar-kamar-paket/get-available-jamaah-for-edit' : '/daftar-kamar-paket/get-available-jamaah';
//     const response = await api.post(url, payload);
//     return handleResponse(response);
//   } catch (error) {
//     console.error('Gagal mengambil data jamaah:', error);
//     throw error;
//   }
// }

export const getKamarById = async (id: number) => {
  try {
    const response = await api.get(`/daftar-kamar-paket/${id}`)
    return handleResponse(response)
  } catch (error) {
    console.error(`Gagal mengambil data kamar dengan ID ${id}:`, error)
    throw error
  }
}

export const updateKamar = async (id: number, payload: any) => {
  try {
    const response = await api.post(`/daftar-kamar-paket/${id}`, payload)
    return handleResponse(response)
  } catch (error) {
    console.error(`Gagal memperbarui kamar dengan ID ${id}:`, error)
    throw error
  }
}

export const deleteKamar = async (id: number) => {
  try {
    const response = await api.delete(`/daftar-kamar-paket/${id}`)
    return handleResponse(response)
  } catch (error) {
    console.error(`Gagal menghapus kamar dengan ID ${id}:`, error)
    throw error
  }
}

export const getDownloadData = async () => {
  try {
    const response = await api.get('/daftar-kamar-paket/download')
    return handleResponse(response)
  } catch (error) {
    console.error('Gagal mengambil data download:', error)
    throw error
  }
}
