const { body } = require("express-validator");
const { 
    Division,
    Paket,
    Kamar
} = require("../models");
const {  getDivisionId, getCompanyIdByCode } = require("../helper/companyHelper");

const validation = {};

validation.check_id_paket = async (value, { req }) => {
  const company_id = await getCompanyIdByCode(req);
  var check = Paket.findOne({ 
    where: { id : value}, 
    include: {
      required : true, 
      model: Division,
      where: { company_id : company_id }
    }
  });
  if (!check) {
      throw new Error("ID Paket tidak terdaftar dipangkalan data");
  }
  return true;
}

validation.check_id_cabang = async (value, { req }) => {
  try {
    const cabang = await Division.findOne({ where: { id: value }, attributes: ["id"] });
    if (!cabang) {
        console.debug(`ID Cabang tidak terdaftar di pangkalan data`);
        throw new Error("ID Cabang tidak terdaftar di pangkalan data");
    }

    const division_id = await getDivisionId(req);
    if (division_id != value) {
        throw new Error("ID Cabang tidak sesuai dengan ID Cabang yang login");
    }
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
validation.check_id_kamar = async (value, { req }) => {
  const company_id = await getCompanyIdByCode(req);
  const check = await Kamar.findOne({ where: { id : value, company_id : company_id }});
  if (!check) {
      throw new Error("ID Kamar tidak terdaftar dipangkalan data");
  }
  return true;
}

module.exports = validation;
