// server/validators/hotelTransactionValidator.js
const { body } = require("express-validator");
const { Hotel_transactions, Mst_hotel, Mst_bank } = require("../models"); // <- sesuaikan path ke model lu
const Akuntansi = require("../library/akuntansi");
const { getCompanyIdByCode } = require("../helper/companyHelper");


const validation = {};

validation.check_mst_hotel_id = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    if(value != '0') {
        var check = await Mst_hotel.findOne({where: { id : value, company_id: company_id }});
        if (!check) {
            throw new Error("ID Hotel ini tidak ditemukan dipangkalan data");
        }
    }else{
      throw new Error("Anda wajib memilih salah satu hotel");
    }
    return true;
}

validation.check_saldo = async ( value, { req} ) => {
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
    if(saldo < ( value * req.body.jumlah_kamar * req.body.jumlah_hari ) ) {
        throw new Error("Jumlah total harga tidak boleh lebih besar dari saldo sumber dana.");
    }else{
        if( ( value * req.body.jumlah_kamar * req.body.jumlah_hari ) <= 1000 ) {
            throw new Error("Jumlah total harga tidak boleh lebih kecil dari Rp 1000 .");
        }
    }
    return true;
}

module.exports = validation;
