import api from './api'

interface BusPayload {
  city_id: number | null
  bus_number: string
  kapasitas_bus: number
  bus_leader: string
  jamaah_ids: (number | null)[]
}

export const getDaftarBusPaket = async (param: any) => {
  try {
    const response = await api.post(`/daftar-bus-paket/get-bus-paket/list`, param)
    return response.data
  } catch (error) {
    console.error('Gagal mengambil daftar bus paket:', error)
    throw error
  }
}

export const getAllJamaah = async (param : any ) => {
  try {
    const response = await api.post(`/daftar-bus-paket/get-available-jamaah`, param);
    return response.data.data
  } catch (error) {
    console.error('Gagal mengambil data jamaah:', error)
    throw error
  }
}

// Tambahkan function baru untuk mengambil daftar kota
export const getAllCities = async () => {
  try {
    const response = await api.get(`/daftar-bus-paket/get-cities`)
    return response.data.data
  } catch (error) {
    console.error('Gagal mengambil daftar kota:', error)
    throw error
  }
}

export const createBus = async (payload: BusPayload) => {
  try {
    const response = await api.post('/daftar-bus-paket/create-bus', payload)
    return response.data
  } catch (error) {
    console.error('Gagal membuat bus:', error)
    throw error
  }
}

export const getBusById = async (id: number) => {
  try {
    const response = await api.get(`/daftar-bus-paket/${id}`)
    return response.data
  } catch (error) {
    console.error(`Gagal mengambil data bus dengan ID ${id}:`, error)
    throw error
  }
}

export const updateBus = async (id: number, payload: any) => {
  try {
    const response = await api.put(`/daftar-bus-paket/${id}`, payload)
    return response.data
  } catch (error) {
    console.error(`Gagal memperbarui bus dengan ID ${id}:`, error)
    throw error
  }
}

export const deleteBus = async (id: number) => {
  try {
    const response = await api.delete(`/daftar-bus-paket/${id}`)
    return response.data
  } catch (error) {
    console.error(`Gagal menghapus bus dengan ID ${id}:`, error)
    throw error
  }
}
