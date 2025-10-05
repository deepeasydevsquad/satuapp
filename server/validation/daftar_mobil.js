const { Mst_mobil } = require("../models");

const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_mobil = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_mobil.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Jenis Mobil tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;