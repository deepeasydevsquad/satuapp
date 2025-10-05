const {
  Akun_bank_administrator,
  Request_deposit_company,
} = require("../models");
const moment = require("moment");

const validation = {};

/* 
    Fungsi untuk mengecek id Bank Administrator didalam databases
*/
validation.check_bank_id = async (value) => {
  const q = await Akun_bank_administrator.findOne({ where: { id: value } });
  if (!q) {
    throw new Error("Id bank tidak terdaftar dipangkalan data.");
  }
  return true;
};

validation.check_id = async (value) => {
  const q = await Request_deposit_company.findOne({ where: { id: value } });
  if (!q) {
    throw new Error("Id tidak terdaftar dipangkalan data.");
  }

  return true;
};

module.exports = validation;
