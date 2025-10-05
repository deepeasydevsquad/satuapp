const { Bank, Bank_pemasukan } = require("../../../db/models");
    
const validation = {};

validation.check_id = async ( value ) => {
  var check = await Bank_pemasukan.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Bank Pemasukan Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
}

module.exports = validation;
  