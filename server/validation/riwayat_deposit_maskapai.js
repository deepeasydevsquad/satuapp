const { Mst_bank, Mst_airline, Riwayat_deposit_airline } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
const Akuntansi = require("../library/akuntansi");
const validation = {};

validation.check_id = async (value, { req }) => {

    console.log("-----XX");
    console.log(req.body.cabang);
    console.log("-----XX");
    const check = await Riwayat_deposit_airline.findOne({
        where: { id: value, division_id: req.body.cabang },
    });
    console.log("-----XX");
    console.log(check); 
    console.log("-----XX");
    // check
    if (!check) {
        throw new Error("ID riwayat deposit airline tidak terdaftar di pangkalan data.");
    }
    return true;
};

validation.check_sumber_dana = async (value, { req }) => {
    if(value != 0){
        const company_id = await getCompanyIdByCode(req);
        const check = await Mst_bank.findOne({
            where: { id: value, company_id },
        });
        // check
        if (!check) {
            throw new Error("ID sumber dana tidak terdaftar di pangkalan data.");
        }
    }
    return true;
};

validation.check_mst_airline_id = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);
    const check = await Mst_airline.findOne({
        where: { id: value, company_id },
    });
    // check
    if (!check) {
        throw new Error("ID Maskapai tidak terdaftar di pangkalan data.");
    }
    return true;
}

validation.check_deposit = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);
    const akuntansi = new Akuntansi(); 
    var nomor_akun = '';
    if( req.body.sumber_dana == '0' ) {
        nomor_akun = '11010';
    }else{
        const qB = await Mst_bank.findOne({ where: { id: req.body.sumber_dana, company_id: company_id } });
        nomor_akun = qB.nomor_akun;
    }
    const saldo = await akuntansi.saldo_masing_masing_akun(nomor_akun, company_id, req.body.cabang, '0');
    if(saldo < value) {
        throw new Error("Jumlah deposit tidak boleh lebih besar dari saldo sumber dana.");
    }else{
        if(value <= 1000) {
            throw new Error("Jumlah deposit tidak boleh lebih kecil dari Rp 1000 .");
        }
    }
    return true;
}

module.exports = validation;
