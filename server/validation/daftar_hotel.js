const { Op, Mst_hotel, Mst_kota } = require("../models");

const { getCompanyIdByCode } = require("../helper/companyHelper");
const { getKotaIdByName } = require("../helper/kotaHelper");

const validation = {};

validation.check_id_hotel = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_hotel.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID hotel tidak terdaftar dipangkalan data");
    }
}

validation.check_kota_hotel = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);

    var check = await Mst_kota.findOne({where: { id : await getKotaIdByName(value, company_id), company_id : company_id }});
    if (!check) {
        throw new Error("Kota tidak terdaftar di pangkalan data, silakan tambahkan kota terlebih dahulu");
    }
    return true;
}

validation.check_edit_hotel = async ( value ,  { req } ) => {
    var body = req.body;
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_hotel.findOne({where: { kota_id : await getKotaIdByName(value, company_id), company_id : company_id, id : { [Op.ne] :  body.id } }});
    if (check) {
        throw new Error("Hotel sudah terdaftar di pangkalan data. Silakan ubah hotel dengan HOTEL yang lain");
    }
    return true;
}

module.exports = validation;