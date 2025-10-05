const { Mst_asuransi } = require("../models");

const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_asuransi = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_asuransi.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Asuransi tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;
  