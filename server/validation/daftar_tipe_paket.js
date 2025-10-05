const { Mst_paket_type } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_tipe_paket = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_paket_type.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Tipe Paket tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;
  