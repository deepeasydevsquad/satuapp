const { Periode, Division, Akun_secondary } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
const validation = {};

validation.check_akun_id = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    if(value != '0') {
        var check = await Akun_secondary.findOne({where: { id : value, company_id: company_id }});
        if (!check) {
            throw new Error("ID Akun ini tidak ditemukan dipangkalan data");
        }
    }
    return true;
}

validation.check_cabang_id = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    if(value != '0') {
        var check = await Division.findOne({where: { id : value, company_id: company_id }});
        if (!check) {
            throw new Error("ID Cabang ini tidak ditemukan dipangkalan data");
        }
    }
    return true;
}

validation.check_periode_id = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    if(value != '0') {
        var check = await Periode.findOne({where: { id : value, company_id: company_id }});
        if (!check) {
            throw new Error("ID Periode ini tidak ditemukan dipangkalan data");
        }
    }
    return true;
}

module.exports = validation;
  