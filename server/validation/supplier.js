const { Op, Supplier, Mst_bank } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
const { getBankIdByName } = require("../helper/bankHelper");    
const validation = {};

validation.check_id_supplier = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Supplier.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Supplier tidak terdaftar dipangkalan data");
    }
}

validation.check_id_bank_supplier = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_bank.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Bank tidak terdaftar dipangkalan data");
    }

    return true;
}

module.exports = validation;
  