

import api from "./api";

export const dataNeracaApi = async (param : any) => {
  try {
    const response = await api.post("/neraca/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data laporan neraca:", error);
    throw error;
  }
};

export const downloadNeracaApi = async (param: any) => {
  try {

    const response = await api.post('/neraca/download_data_neraca', param, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // Buat URL dari blob
    const url = window.URL.createObjectURL(blob)

    // Buat element <a> buat trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'data_neraca.xlsx') // Nama file
    document.body.appendChild(link)
    link.click()

    // Cleanup
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Gagal download data neraca:', error)
    throw error
  }
}
