const { Mst_airline, Jurnal, Division } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_airlines = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_airline.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Maskapai tidak terdaftar dipangkalan data");
    }
}

validation.check_delete_is_allow = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    const q = await Mst_airline.findOne({
        where: { id: value },
    });
    const nomor_akun = [q.nomor_akun_deposit, q.nomor_akun_pendapatan, q.nomor_akun_hpp];
    var error = false;
    for( let x in nomor_akun ) {
        var qDebet = await Jurnal.findAndCountAll({ where: { akun_debet : nomor_akun[x] }, include: { model: Division, required: true, where: { company_id: company_id } } } );
        var qKredit = await Jurnal.findAndCountAll({ where: { akun_kredit : nomor_akun[x] }, include: { model: Division, required: true, where: { company_id: company_id } } } );
        if( qDebet.count > 0 ) {
            error = true;
        }
        if( qKredit.count > 0 ) {
            error = true;
        }
    }
    if( error ) {
        throw new Error("Maskapai ini tidak dapat dihapus, karena masih digunakan di Tabel Jurnal. Silahkan hapus terlebih dahulu di Jurnal agar Maskapai ini dapat dihapus.");
    }
    return true;
}

module.exports = validation;