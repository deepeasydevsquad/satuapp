const { 
    Paket,
    Paket_transaction,
    Division
} = require("../models");
const { getCabang, getDivisionId } = require("../helper/companyHelper");

const validation = {};

validation.check_id_paket = async (value, { req }) => {
    const division_id = await getDivisionId(req);
    var check = Paket.findOne({ where: { id : value, division_id : division_id }});
    if (!check) {
        throw new Error("ID Paket tidak terdaftar dipangkalan data");
    }
    return true;
}

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

validation.check_id_transpaket = async (value, { req }) => {
    const division_id = await getCabang(req);
    var check = await Paket_transaction.findOne({ where: { id : value, division_id : division_id }});
    if (!check) {
        throw new Error("ID Transaksi Paket tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;