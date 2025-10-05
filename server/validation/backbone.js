const { Akun_administrator } = require("../models");

const validation = {};

validation.username_login_process = async (value) => {
  var check = await Akun_administrator.findOne({
    where: { username: value },
  });
  if (!check) {
    throw new Error("Username tidak ditemukan dipangkalan data.");
  }
  return true;
};

module.exports = validation;
