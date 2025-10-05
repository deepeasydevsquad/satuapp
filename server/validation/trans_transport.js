const { body } = require("express-validator");
const { Mst_bank, Transport_transaction, Division } = require("../models"); // <- sesuaikan path ke model lu
const Akuntansi = require("../library/akuntansi");
const { getCompanyIdByCode } = require("../helper/companyHelper");

const validation = {};

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
 
    const details = req.body.details || [];

    const totalPrice = details.reduce((sum, item) => {
       return sum + (parseFloat(item.travelPrice) || 0);
    }, 0);
  
    if(saldo < totalPrice ) {
        throw new Error("Jumlah total harga travel tidak boleh lebih besar dari saldo sumber dana.");
    }

    return true;
}

validation.check_id = async  ( value, { req} ) => {
    const company_id = await getCompanyIdByCode(req);
    const q = await Transport_transaction.findOne({ 
        where: { id: value }, 
        include: {
            model: Division,
            required: true,
            where: {
                company_id: company_id,
            }
        }
    });
    if (!q) {
        throw new Error("ID Transaksi transport tidak terdaftar dipangkalan data");
    }
    
    return true;
}

module.exports = validation;
