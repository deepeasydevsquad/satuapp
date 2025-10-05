// const { body } = require("express-validator");

// const validation = {};

// validation.createBus = [
//   // Memeriksa 'city_id'
//   body("city_id")
//     .notEmpty()
//     .withMessage("Nama Kota harus dipilih.")
//     .isInt()
//     .withMessage("ID Kota tidak valid."),

//   // Memeriksa 'bus_number'
//   body("bus_number")
//     .notEmpty()
//     .withMessage("Nomor Bus tidak boleh kosong.")
//     .isString()
//     .withMessage("Nomor Bus harus berupa Plat Nomor."),

//   // Memeriksa 'kapasitas_bus'
//   body("kapasitas_bus")
//     .notEmpty()
//     .withMessage("Kapasitas bus tidak boleh kosong.")
//     .isInt({ min: 1 })
//     .withMessage("Kapasitas harus berupa angka dan minimal 1."),

//   body("bus_leader")
//     .notEmpty()
//     .withMessage("Bus Leader tidak boleh kosong.")
//     .isString()
//     .withMessage("Bus Leader harus diisi."),

//   // Memeriksa 'jamaah_ids'
//   body("jamaah_ids")
//     .isArray()
//     .withMessage("Data jamaah tidak valid.")
//     .custom((value, { req }) => {
//       if (value.length > 0 && value.length > req.body.kapasitas_bus) {
//         throw new Error("Jumlah jamaah tidak boleh melebihi kapasitas bus.");
//       }
//       return true;
//     }),
// ];


// body("id").trim().custom(validation.check_id_bus),
//     body("paket_id").trim().notEmpty().withMessage("Paket ID tidak boleh kosong.").custom(validation.check_id_paket),
//     body("division_id").trim().notEmpty().withMessage("Division ID tidak boleh kosong.").custom(validation.check_id_cabang),


const { body } = require("express-validator");
const { Division, Paket, Bus } = require("../models");
const {  getDivisionId, getCompanyIdByCode } = require("../helper/companyHelper");

const validation = {};

validation.check_id_bus = async (value, { req }) => {
  const company_id = await getCompanyIdByCode(req);
  const check = await Bus.findOne({ where: { id : value, company_id : company_id }});
  if (!check) {
      throw new Error("ID Bus tidak terdaftar dipangkalan data");
  }
  return true;
}

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


module.exports = validation;
