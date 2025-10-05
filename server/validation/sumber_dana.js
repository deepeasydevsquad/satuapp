const { Mst_bank, Division } = require("../models");
const { getCompanyIdByCode, getCabang, tipe } = require("../helper/companyHelper");
const Akuntansi = require("../library/akuntansi");
const { body } = require("express-validator");
const validation = {};

validation.sumber_dana = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    if(value != 0  ) {
        var check = await Mst_bank.findOne({where: { id : value, company_id : company_id }});
        if (!check) {
            throw new Error("ID Bank tidak terdaftar dipangkalan data");
        }
    }
    return true;
}

validation.check_jumlah_dana = async ( value, { req } ) => {
    const body = req.body;
    const company_id = await getCompanyIdByCode(req);
    const division_id = req.body.cabang;
    const akuntansi = new Akuntansi(); 
    var nomor_akun = '0';
    var nama_akun = '';
    if( body.sumber_dana == 0 ) {
        nomor_akun = '11010';
        nama_akun = 'Kas';
    }else{
        const qB = await Mst_bank.findOne({ where: { id: body.sumber_dana, company_id: company_id } });
        nomor_akun = qB.nomor_akun;
        nama_akun = qB.kode;
    }
    const saldo = await akuntansi.saldo_masing_masing_akun(nomor_akun, company_id, division_id, '0');
    const total = body.jumlah * value; // perkalian antara jumlah dan harga beli
    // filter
    if( saldo < total ) {
        throw new Error(`Saldo Akun ${ nama_akun} tidak mencukupi untuk melakukan transaksi ini.`);
    }

    return true
}

validation.check_cabang = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    const division_id = await getCabang(req);
    if( value != 0 ) {
        if( tipe == 'staff') {
            if(value != division_id) {
                throw new Error("Cabang tidak sesuai dengan cabang pengguna");
            }
        }else{
            const check = await Division.findOne({ where: { id: value, company_id: company_id } });
            if (!check) {
                throw new Error("Cabang tidak terdaftar di pangkalan data");
            }
        }
   }
    return true;
}


module.exports = validation;
  