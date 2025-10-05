import api from './api' // Import service API

export const get_kas_keluar_masuk_data = async (invoice : string) => {
  try {
    const response = await api.get(`/invoice/kas-keluar-masuk/${invoice}`) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal mengambil data deposit', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const get_header = async () => {
  try {
    const response = await api.get(`/invoice/header`) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal mengambil data deposit', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const dataInvoiceDeposit = async (param: string) => {
  try {
    const response = await api.get(`/invoice/invoice-deposit/${param}`) // Kirim data ke backend
    return response.data // Kembalikan data hasil request
  } catch (error) {
    console.error('Gagal mengambil data deposit', error)
    throw error // Bisa ditangani di bagian pemanggilan
  }
}

export const getInvoicePaketLA = async (param : string) => {
  try {
    const response = await api.get(`/invoice/invoice-paket-la/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil invoice paket la:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};


export const getKwitansiTerakhir = async (param : string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-terakhir/${param}`); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil kwitansi terakhir paket la:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const getKwitansiTabunganUmrah = async (param : string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-tabungan-umrah/${param}`); // Kirim data ke backend
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil kwitansi terakhir tabungan umrah:", error);
  }
};

export const getInvoicePembayaranPerbulan = async (param : string) => {
  try {
    const response = await api.get(`/invoice/pembayaran-perbulan/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil invoice pembayaran perbulan:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
}

export const getKwitansiHandoverFasilitas = async (param : string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-handover-fasilitas/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil kwitansi handover fasilitas:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const getKwitansiHandoverBarang = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-handover-barang/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi handover barang:", error);
    throw error;
  }
}

export const getKwitansiPengembalianBarang = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-pengembalian-handover-barang/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi pengembalian barang:", error);
    throw error;
  }
}

export const cetakKwitansiVisa = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-visa/${param}`);
    return response.data;
  } catch (error) {
    console.error('[SERVICE ERROR] Gagal saat mencetak kwitansi visa:', error);
    throw error;
  }
};

export const kwitansi_pembayaran_fee_agen = async (param: string) => {
  try {
    const response = await api.get(`/invoice/pembayaran-fee-agen/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi pengembalian barang:", error);
    throw error;
  }
}

export const getKwitansiPembayaranTransaksiPaketUmrah = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-pembayaran-transaksi-paket-umrah/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi handover barang:", error);
    throw error;
  }
}

export const kwitansi_trans_hotel = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-trans-hotel/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi pengembalian barang:", error);
    throw error;
  }
}

export const cetakKwitansiPassport = async (invoice: string) => {
  try {
    if (!invoice || invoice === 'undefined' || invoice === 'null') {
      throw new Error('Invoice tidak valid atau kosong.');
    }
    const encodedInvoice = encodeURIComponent(invoice);
    const url = `/invoice/kwitansi-passport/${encodedInvoice}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error('[SERVICE ERROR] Gagal saat mencetak kwitansi passport:', error);
    throw error;
  }
};

export const getKwitansiHandoverFasilitasPaket = async (param : string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-handover-fasilitas-paket/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.error("Gagal mengambil kwitansi handover fasilitas:", error);
    throw error; // Bisa ditangani di bagian pemanggilan
  }
};

export const getKwitansiHandoverBarangPaket = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-handover-barang-paket/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi handover barang paket:", error);
    throw error;
  }
}

export const getKwitansiPengembalianBarangPaket = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-pengembalian-handover-barang-paket/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi pengembalian barang:", error);
    throw error;
  }
}

export const kwitansi_trans_transport = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-trans-transport/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi transport:", error);
    throw error;
  }
}

export const kwitansi_trans_fasilitas = async (param: string) => {
  try {
    const response = await api.get(`/invoice/kwitansi-trans-fasilitas/${param}`); // Kirim data melewait URL
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi trans fasilitas:", error);
    throw error;
  }
}

export const kwitatsi_trans_tiket = async (param: string) => {
  try {
    const response = await api.get(`/invoice/trans-tiket/${param}`); 
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi trans tiket:", error);
    throw error;
  }
}

export const kwitansi_refund_tiket = async (param: string) => {
  try {
    const response = await api.get(`/invoice/refund-tiket/${param}`); 
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi trans tiket:", error);
    throw error;
  }
}

export const kwitansi_pembayaran_tiket = async (param: string) => {
  try {
    const response = await api.get(`/invoice/pembayaran-tiket/${param}`); 
    return response.data; // Kembalikan data hasil request
  } catch (error) {
    console.log("Gagal mengambil kwitansi trans tiket:", error);
    throw error;
  }
}

