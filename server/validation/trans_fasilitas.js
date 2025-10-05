const { Op, Paket, Mst_fasilitas, Transaction_fasilitas, Transaction_fasilitas_detail, Paket_transaction, Kostumer, Division } = require("../models");
const { getDivisionId, getCompanyIdByCode } = require("../helper/companyHelper");

const validation = {};

validation.check_id_paket = async (value, { req }) => {
    const division_id = await getDivisionId(req);
    var check = await Paket.findOne({ where: { id : value, division_id : division_id }});
    if (!check) {
        throw new Error("ID Paket tidak terdaftar dipangkalan data");
    }
    return true;
}

validation.check_id_transfasilitas = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);    
    var check = await Transaction_fasilitas.findOne({ where: { id : value }, include: { model: Division, required: true, where: { company_id: company_id }}});
    if (!check) {
        throw new Error("ID Transaksi Fasilitas tidak terdaftar dipangkalan data");
    }
}

validation.check_id_transpaket = async (value, { req }) => {
    const division_id = await getDivisionId(req);
    var check = await Paket_transaction.findOne({ where: { id : value, division_id : division_id }});
    if (!check) {
        throw new Error("ID Transaksi Paket tidak terdaftar dipangkalan data");
    }
}

validation.check_id_kostumer = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Kostumer.findOne({ where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Kostumer tidak terdaftar dipangkalan data");
    }
}

// Validasi ID Cabang
validation.check_id_cabang = async (value, { req }) => {4
    const company_id = await getCompanyIdByCode(req);
    try {
        const cabang = await Division.findOne({
            where: { id: value, company_id: company_id },
            attributes: ["id"],
        });

        if (!cabang) {
            console.debug(`ID Cabang tidak terdaftar di pangkalan data`);
            throw new Error("ID Cabang tidak terdaftar di pangkalan data");
        }

        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

validation.check_id_fasilitas = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_fasilitas.findOne({ where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Fasilitas tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;
