import api from './api'

export const daftarLevelAgen = async () => {
   try {
    const { data } = await api.get('/member/level-agen')
    return data
  } catch (error) {
    console.log('gagal mengambil info level agen:', error)
    throw error
  }
}

export const daftarUpline = async (param: any) => {
   try {
    const { data } = await api.post('/member/daftar-upline', param)
    return data
  } catch (error) {
    console.log('gagal mengambil info daftar upline:', error)
    throw error
  }
}
//

export const getInfoEditMember = async ( param : any ) => {
  try {
    const { data } = await api.post('/member/infoEditMember', param )
    return data
  } catch (error) {
    console.log('gagal mengambil info edit membe:', error)
    throw error
  }
}

export const daftarMember = async (param: any) => {
  try {
    const { data } = await api.post('/member/daftarMember', param )
    return data
  } catch (error) {
    console.log('gagal menambahkan data:', error)
    throw error
  }
}

export const getMember = async (id:number) => {
  try {
    const response = await api.post("/member/get-member", { id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil asuransi:", error);
    throw error;
  }
}

export const addMember = async (param: any) => {
  try {
    const { data } = await api.post('/add-member', param, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  } catch (error) {
    console.log('gagal menambahkan data:', error)
    throw error
  }
}

export const editMember = async (param: any) => {
  try {
    const { data } = await api.put('/update-member', param, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  } catch (error) {
    console.log('gagal edit data', error)
    throw error
  }
}

export const deleteMember = async (id: number) => {
  try {
    const { data } = await api.post('/member/delete-member', { id: id })
    console.log('Tipe data ID:', typeof id) // Debug tipe data
    return data
  } catch (error) {
    console.log('gagal hapus data', error)
    throw error
  }
}

export const getType = async () => {
  try {
    const { data } = await api.get('/get-type')
    return data
  } catch (error) {
    console.log('gagal mengambiltype:', error)
    throw error
  }
}

export const daftarCabang = async () => {
  try {
    const { data } = await api.get('/member/get-daftar-cabang')
    return data
  } catch (error) {
    console.log('gagal mengambiltype:', error)
    throw error
  }
}

export const makeAnAgen = async (param: any) => {
  try {
    const { data } = await api.post('/member/make-an-agen', param )
    return data
  } catch (error) {
    console.log('gagal menambahkan data:', error)
    throw error
  }
}

