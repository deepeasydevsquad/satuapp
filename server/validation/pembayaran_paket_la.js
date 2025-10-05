const { Paket_la } = require("../models");
const { getCabang } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_paket_la = async ( value, { req } ) => {
    const division_id = await getCabang(req);
    var check = await Paket_la.findOne({ where: { id : value, division_id : division_id }});
    if (!check) {
        throw new Error("ID Paket LA tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;
  