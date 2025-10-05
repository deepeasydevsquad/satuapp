import api from "./api";

export const daftarPaket = async (param : any) => {
  try {
    const response = await api.post("/daftar-paket/list", param);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil paket:", error);
    throw error;
  }
};

export const getPaket = async (id : number, division_id : number) => {
  try {
    const response = await api.post(`/daftar-paket/paketlist`, { id: id, division_id: division_id });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil paket:", error);
    throw error;
  }
};

export const addPaket = async (param : any) => {
  try {
    const { data } = await api.post('/daftar-paket/add', param, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  } catch (error) {
    console.error("Gagal menambahkan paket:", error);
    throw error;
  }
};

export const editPaket = async (id: any, param: any) => {
  try {
    const formData = new FormData();

    // Loop semua key
    for (const key in param) {
      if (param[key] instanceof File) {
        formData.append(key, param[key]); // photo atau file
      } else if (typeof param[key] === "object") {
        formData.append(key, JSON.stringify(param[key])); // array/object
      } else {
        formData.append(key, param[key]); // string/number
      }
    }

    const response = await api.post("/daftar-paket/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Gagal mengedit paket:", error);
    throw error;
  }
};


export const deletePaket = async (id : number, division_id : number) => {
  try {
    const response = await api.post(`/daftar-paket/delete`,{ id : id, division_id: division_id});
    if (response.status !== 200) {
      throw new Error('Status bukan 200');
    }
    return response.data;
  } catch (error) {
    console.error("Gagal menghapus paket:", error);
    throw error;
  }
};
