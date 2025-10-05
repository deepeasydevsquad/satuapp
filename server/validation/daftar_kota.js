const { Op, Mst_kota } = require("../models");

const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_add_kode_kota = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_kota.findOne({where: { kode : value, company_id : company_id }});
    if (check) {
        throw new Error("Kode kota sudah terdaftar di pangkalan data. Silakan ubah kode kota dengan KODE KOTA yang lain");
    }
    return true;
}

validation.check_id_kota = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_kota.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Kota tidak terdaftar dipangkalan data");
    }
}

validation.check_edit_kode_kota = async ( value ,  { req } ) => {
    var body = req.body;
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_kota.findOne({where: { kode : value, company_id : company_id, id : { [Op.ne] :  body.id } }});
    if (check) {
        throw new Error("Kode kota sudah terdaftar di pangkalan data. Silakan ubah kode kota dengan KODE KOTA yang lain");
    }
    return true;
}

module.exports = validation;