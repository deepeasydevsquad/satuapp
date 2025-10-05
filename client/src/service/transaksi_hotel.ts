import api from "./api";

export const daftar_kota = async (param : any) => {
    try {
        const response = await api.get("/trans_hotel/daftar_kota", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const get_jenis_hotel = async () => {
    try {
        const response = await api.get("/trans_hotel/daftar_hotel");
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const daftar_transaksi = async (param : any) => {

    try {
        const response = await api.post("/trans_hotel/daftar_transaksi", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const addHotelUrl = async (param : any) => {
    try {
        const response = await api.post("/trans_hotel/add_transaksi", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const hapus_transaksi = async (param : any) => {
    try {
        const response = await api.post("/trans_hotel/delete_transaksi", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const daftar_paket = async (param : any) => {
    try {
        const response = await api.post("/trans_hotel/daftar_paket", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const daftar_customer = async () => {
    try {
        const response = await api.get("/trans_hotel/daftar_customer", );
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}
