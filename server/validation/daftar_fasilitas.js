const { Mst_fasilitas, Jurnal, Division } = require("../models");

const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_fasilitas = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Mst_fasilitas.findOne({where: { id : value, company_id : company_id }});
    if (!check) {
        throw new Error("ID Fasilitas tidak terdaftar dipangkalan data");
    }
}

validation.check_delete_is_allow = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    const q = await Mst_fasilitas.findOne({
        where: { id: value },
    });
    const nomor_akun_aset = q.nomor_akun_aset;
    const nomor_akun_hpp = q.nomor_akun_hpp;
    const nomor_akun_pendapatan = q.nomor_akun_pendapatan;
    var error = false;
    const qDebetAset = await Jurnal.findAndCountAll({ where: { akun_debet : nomor_akun_aset }, include: { model: Division, required: true, where: { company_id: company_id } } } );
    const qKreditAset = await Jurnal.findAndCountAll({ where: { akun_kredit : nomor_akun_aset }, include: { model: Division, required: true, where: { company_id: company_id } } } );
    if( qDebetAset.count > 0 ) {
        error = true;
    }
    if( qKreditAset.count > 0 ) {
        error = true;
    }

    const qDebetHPP = await Jurnal.findAndCountAll({ where: { akun_debet : nomor_akun_hpp }, include: { model: Division, required: true, where: { company_id: company_id } } } );
    const qKreditHPP = await Jurnal.findAndCountAll({ where: { akun_kredit : nomor_akun_hpp }, include: { model: Division, required: true, where: { company_id: company_id } } } );
    if( qDebetHPP.count > 0 ) {
        error = true;
    }
    if( qKreditHPP.count > 0 ) {
        error = true;
    }

    const qDebetPendapatan = await Jurnal.findAndCountAll({ where: { akun_debet : nomor_akun_pendapatan }, include: { model: Division, required: true, where: { company_id: company_id } } } );
    const qKreditPendapatan = await Jurnal.findAndCountAll({ where: { akun_kredit : nomor_akun_pendapatan }, include: { model: Division, required: true, where: { company_id: company_id } } } );
    if( qDebetPendapatan.count > 0 ) {
        error = true;
    }
    if( qKreditPendapatan.count > 0 ) {
        error = true;
    }

    if( error ) {
        throw new Error("Fasilitas ini tidak dapat dihapus, karena masih digunakan di Tabel Jurnal. Silahkan hapus terlebih dahulu di Jurnal agar Fasilitas ini dapat dihapus.");
    }
    return true;
}

module.exports = validation;