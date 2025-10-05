const { Paket } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
const validation = {};

validation.check_paket_id = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Paket.findOne({where: { id : value, company_id: company_id }});
    if (!check) {
        throw new Error("ID Paket ini tidak ditemukan dipangkalan data");
    }
    return true;
}

module.exports = validation;
  