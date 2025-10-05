const { 
    Ticket_rekapitulasi, 
    Ticket_transaction, 
    Op 
} = require("../models");
const { getCabang } = require("../helper/companyHelper");
const validation = {};

validation.check_id_transaksi_ticket = async (value, { req }) => {
    const division_id = await getCabang(req);

    if (!Array.isArray(value) || value.length === 0) {
        throw new Error("ID Transaksi Tiket harus berupa array dan tidak boleh kosong.");
    }

    const parsedIds = value.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
    if (parsedIds.length !== value.length) {
        throw new Error("Semua ID Transaksi Tiket harus berupa angka yang valid.");
    }
    const rows = await Ticket_transaction.findAll({
        attributes: ['id'],
        where: {
            id: { [Op.in]: parsedIds },
            division_id,
        },
        raw: true,
    });

    const foundIds = rows.map(r => r.id);
    const notFound = parsedIds.filter(id => !foundIds.includes(id));

    if (notFound.length > 0) {
        console.error("ID tidak ditemukan:", notFound);
        throw new Error(`ID Transaksi Tiket berikut tidak ditemukan atau tidak sesuai divisi: ${notFound.join(", ")}`);
    }
    return true;
};

validation.check_id_rekapitulasi_ticket = async (value, { req }) => {
    const division_id = await getCabang(req);
    if (!value) {
        throw new Error("ID Rekapitulasi Tiket tidak ditemukan.");
    }
    
    try {
        const rekapitulasi = await Ticket_rekapitulasi.findOne({
            where: { id: value, division_id: division_id },
        });
        
        if (!rekapitulasi) {
            throw new Error("ID Rekapitulasi Tiket tidak terdaftar di pangkalan data.");
        }
    } catch (error) {
        throw new Error("Gagal memvalidasi ID Rekapitulasi Tiket: " + error.message);
    }
    
    return true;
}

validation.check_register_number_ticket = async (value, { req }) => {
    if (!value) {
        throw new Error("Nomor Register Tiket tidak ditemukan.");
    }
    
    try {
        const rekapitulasi = await Ticket_rekapitulasi.findOne({
            where: {
                registration_number: value,
                division_id: await getCabang(req),
            },
        });
        
        if (!rekapitulasi) {
            throw new Error("Nomor Register Tiket tidak terdaftar di pangkalan data.");
        }
    } catch (error) {
        throw new Error("Gagal memvalidasi Nomor Register Tiket: " + error.message);
    }
    
    return true;
}

module.exports = validation;
