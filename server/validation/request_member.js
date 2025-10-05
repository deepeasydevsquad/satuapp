const { Request_member } = require("../models");
const moment = require("moment");
    
const validation = {};

/* 
    Fungsi untuk mengecek id request member didalam databases
*/
validation.check_id_request_member = async ( value ) => {
    const q = await Request_member.findOne({ where: { id: value }, });
    if (!q) {
        throw new Error("Id ini sudah terdaftar dipangkalan data.");
    }
    return true;
}

module.exports = validation;
  