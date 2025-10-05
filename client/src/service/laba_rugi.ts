

import api from "./api"; // Import service API

export const dataLabaRugiAPI = async (param : any) => {
  try {
    const response = await api.post("/laba_rugi/list", param); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil kota:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const downloadLabaRugiAPI = async (param: any) => {
  try {
    const response = await api.post('/laba_rugi/download_data_laba_rugi', param, {
      responseType: 'blob', // << penting biar axios handle sebagai file
    })

    // Bikin blob dari data response
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // Buat URL dari blob
    const url = window.URL.createObjectURL(blob)

    // Buat element <a> buat trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'data_laba_rugi.xlsx') // Nama file
    document.body.appendChild(link)
    link.click()

    // Cleanup
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Gagal download data laba rugi:', error)
    throw error
  }
}

// export const addKota = async (param : any) => {
//   try {
//     const response = await api.post("/daftar_kota", param); // Kirim data ke backend
//     return response.data; // Kembalikan data hasil request
//   } catch (error) {
//     console.error("Gagal menambahkan kota:", error);
//     throw error; // Bisa ditangani di bagian pemanggilan
//   }
// };

// export const editKota = async (id : any, param : any) => {
//   try {
//     const response = await api.post(`/daftar_kota/update` , {...param,...{id : id }}); // Kirim data ke backend
//     return response.data; // Kembalikan data hasil request
//   } catch (error) {
//     console.error("Gagal mengedit kota:", error);
//     throw error; // Bisa ditangani di bagian pemanggilan
//   }
// };

// export const deleteKota = async (id : number) => {
//   try {
//     const response = await api.post(`/daftar_kota/delete`,{ id : id}); // Kirim data ke backend
//     return response.data; // Kembalikan data hasil request
//   } catch (error) {
//     console.error("Gagal menghapus kota:", error);
//     throw error; // Bisa ditangani di bagian pemanggilan
//   }
// };
// deleteKota
