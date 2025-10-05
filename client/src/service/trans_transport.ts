import api from "./api";

export const daftar_transaksi = async (param : any) => {
    try {
        const response = await api.post("/trans_transport/daftar_transaksi", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const add_transaksi = async (param : any) => {
    try {
        const response = await api.post("/trans_transport/add_transaksi", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const delete_transaksi = async (param : any) => {
    try {
        const response = await api.post("/trans_transport/delete_transaksi", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const daftar_mobil = async () => {
    try {
        const response = await api.get("/trans_transport/daftar_mobil");
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const daftar_paket = async (param : any) => {
    try {
        const response = await api.post("/trans_transport/daftar_paket", param);
        return response.data;
    } catch (error) {
        console.error("Gagal menambahkan tiket:", error);
        throw error;
    }
}

export const daftar_kostumer = async () => {
    try {
        const response = await api.get("/trans_transport/daftar_customer");
        return response.data;
    } catch (error) {
        throw error;
    }
}
