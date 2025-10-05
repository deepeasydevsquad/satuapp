const { 
    Op,
    Paket,
    Paket_transaction,
    Handover_fasilitas_paket,
    Handover_barang_paket,
    Handover_fasilitas_detail_paket,
    Mst_fasilitas,
    Division,
    Item_fasilitas
} = require("../models");
const { getCabang, getCompanyIdByCode, getDivisionId } = require("../helper/companyHelper");

const validation = {};

validation.check_id_cabang = async (value, { req }) => {
    try {
        const cabang = await Division.findOne({ where: { id: value }, attributes: ["id"] });
        if (!cabang) {
            console.debug(`ID Cabang tidak terdaftar di pangkalan data`);
            throw new Error("ID Cabang tidak terdaftar di pangkalan data");
        }

        const division_id = await getDivisionId(req);
        if (division_id != value) {
            throw new Error("ID Cabang tidak sesuai dengan ID Cabang yang login");
        }
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

validation.check_id_paket = async (value, { req }) => {
    var check = Paket.findOne({ where: { id : value }});
    if (!check) {
        throw new Error("ID Paket tidak terdaftar dipangkalan data");
    }
    return true;
}

validation.check_id_transpaket = async (value, { req }) => {
    var check = await Paket_transaction.findOne({ where: { id : value }});
    if (!check) {
        throw new Error("ID Transaksi Paket tidak terdaftar dipangkalan data");
    }
}

validation.check_mst_paket = async (value, { req }) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        const transpaketId = req.body.id;

        const paketTransaction = await Paket_transaction.findByPk(transpaketId);
        const paket = await Paket.findByPk(paketTransaction.paket_id, {
            attributes: ['facilities'],
            raw: true,
        });

        const fasilitasIds = JSON.parse(paket?.facilities || '[]').map(f => +f.id);
        if (!fasilitasIds.length) {
            throw new Error('Tidak ada fasilitas yang tersedia di paket');
        }

        // Ambil ID fasilitas yang sudah digunakan
        const usedIds = await Handover_fasilitas_detail_paket.findAll({
            // 
            attributes: [],
            include: [{
                model: Handover_fasilitas_paket,
                where: { paket_transaction_id: transpaketId },
            },
            {
                model: Item_fasilitas,
                attributes: ['mst_fasilitas_id'],
                // where: { paket_transaction_id: transpaketId },
            }],
            // raw: true,
        }).then(rows => rows.map(r => r.Item_fasilita.mst_fasilitas_id));

        // Ambil semua fasilitas yang tersedia dan belum digunakan
        const fasilitasTersedia = await Mst_fasilitas.findAll({
            where: {
                id: {
                [Op.in]: fasilitasIds,
                ...(usedIds.length && { [Op.notIn]: usedIds }), // hanya filter kalau ada usedIds
                },
                company_id,
            },
            attributes: ['id'],
            raw: true,
        });

        const validIdSet = new Set(fasilitasTersedia.map(f => f.id));

        for (const id of value) {
            const fasilitasId = Number(id);
            if (!validIdSet.has(fasilitasId)) {
                throw new Error(`Fasilitas ID ${fasilitasId} tidak tersedia atau sudah digunakan`);
            }
        }

        return true;
    } catch (error) {
        console.error('[check_mst_paket]', error);
        throw error;
    }
};

validation.check_id_handover_barang = async (value, { req }) => {
    try {
        // Validasi: apakah semua ID ada di Handover_barang?
        const handoverBarang = await Handover_barang_paket.findAll({
            where: {
                id: {
                    [Op.in]: value,
                },
                paket_transaction_id: req.body.id,
            },
        });

        if (handoverBarang.length !== value.length) {
            const missingIds = value.filter(id => !handoverBarang.map(hb => hb.id).includes(id));
            throw new Error(`ID Handover Barang ${missingIds.join(', ')} tidak ditemukan`);
        }

        // Validasi: apakah status belum dikembalikan?
        const dikembalikan = handoverBarang.find(hb => hb.status.toLowerCase() === 'dikembalikan');
        if (dikembalikan) {
            throw new Error(`Handover Barang dengan ID ${dikembalikan.id} sudah dikembalikan`);
        }

        return true;
    } catch (error) {
        console.log('[check_id_handover_barang]', error);
        throw error;
    }
};

module.exports = validation;