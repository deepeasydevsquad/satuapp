const { Mst_provider } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_provider_visa = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_provider.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Provider Visa tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;
  