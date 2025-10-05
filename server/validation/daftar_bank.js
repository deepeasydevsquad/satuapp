const { Op, Mst_bank } = require("../models");

const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_bank = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_bank.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Kota tidak terdaftar dipangkalan data");
    }
}

validation.check_add_kode_bank = async ( value,  { req } ) => {
    if (/\d/.test(value)) {
        throw new Error("Kode bank tidak boleh mengandung angka.");
    }

    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_bank.findOne({where: { kode : value, company_id : company_id }});
    if (check) {
        throw new Error("Kode bank sudah terdaftar di pangkalan data. Silakan ubah kode bank dengan KODE BANK yang lain");
    }
    
    return true;
}

validation.check_edit_kode_bank = async ( value,  { req } ) => {
    if (/\d/.test(value)) {
        throw new Error("Kode bank tidak boleh mengandung angka.");
    }
    
    var body = req.body;
    const company_id = await getCompanyIdByCode(req);
    if(body.id) {
        var check = await Mst_bank.findOne({where: { kode : value, company_id : company_id, id :  { [Op.ne] : body.id } }});
        if (check) {
            throw new Error("Kode bank sudah terdaftar di pangkalan data. Silakan ubah kode bank dengan KODE BANK yang lain");
        }
    }else{
        var check = await Mst_bank.findOne({where: { kode : value, company_id : company_id }});
        if (check) {
            throw new Error("Kode bank sudah terdaftar di pangkalan data. Silakan ubah kode bank dengan KODE BANK yang lain");
        }
    }
    
    return true;
}

module.exports = validation;