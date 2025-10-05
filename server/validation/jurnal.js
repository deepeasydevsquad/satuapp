const { Jurnal, Periode, Division, Op } = require("../models");
// const { getCompanyIdByCode } = require("../helper/companyHelper");
const{ getCompanyIdByCode, tipe, getCabang, getSeluruhCabangId } = require("../helper/companyHelper");
const validation = {};

validation.check_periode = async ( value,  { req } ) => {
    if(value != '0') {
        const company_id = await getCompanyIdByCode(req);
        var check = await Periode.findOne({where: { id : value, company_id: company_id }});
        if (!check) {
            throw new Error("Periode ini tidak ditemukan dipangkalan data");
        }
    }
    return true;
}

validation.check_cabang = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    if( value != '0' ) {
        var check = await Division.findOne({where: { id : value, company_id : company_id }});
        if (!check) {
            throw new Error("Cabang Tidak Ditemukan Dipangkalan Data");
        }
    }
    return true;
}

validation.check_id_jurnal = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    const division_id = await getSeluruhCabangId(company_id);
    var check = await Jurnal.findOne({where: { id : value, division_id : { [Op.in] : division_id }, removable: 'true' }});
    if (!check) {
        throw new Error("ID Jurnal ini tidak terdaftar dipangkalan data");
    }
    return true;
}

validation.check_hak_akses = async ( value,  { req } ) => {
    const type = await tipe(req);
    if( type !== 'administrator') {
        throw new Error("Anda tidak berhak melakukan aksi ini");
    }
    return true;
}


module.exports = validation;
  