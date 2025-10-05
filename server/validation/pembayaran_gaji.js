const { Mst_bank } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
const Akuntansi = require("../library/akuntansi");
    
const validation = {};

validation.check_sumber_dana = async ( value, { req } ) => {
    if(value == 0 ) {
        throw new Error("Anda wajib memilih salah satu sumber dana.");
    }else if(value != 'kas'){
        const company_id = await getCompanyIdByCode(req);
        const check = await Mst_bank.findOne({ where: { id: value, company_id }, });
        // check
        if (!check) {
            throw new Error("ID sumber dana tidak terdaftar di pangkalan data.");
        }
    }
    return true;
}

validation.check_nominal = async ( value, { req } ) => {
    const body = req.body;
    const company_id = await getCompanyIdByCode(req);
    const akuntansi = new Akuntansi(); 
    var nomor_akun = '0';
    var nama_akun = '';
    if( body.sumber_dana == 'kas' ) {
        nomor_akun = '11010';
        nama_akun = 'Kas';
    }else{
        const qB = await Mst_bank.findOne({ where: { id: body.sumber_dana, company_id: company_id } });
        nomor_akun = qB.nomor_akun;
        nama_akun = qB.kode;
    }
    const saldo = await akuntansi.saldo_masing_masing_akun(nomor_akun, company_id, body.division_id, '0');
    // filter
    if( saldo < value ) {
        throw new Error(`Saldo Akun ${ nama_akun} tidak mencukupi untuk melakukan transaksi ini.`);
    }
    return true
}

module.exports = validation;
  