const { Mst_airport } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_bandara = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_airport.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Kota tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;
  