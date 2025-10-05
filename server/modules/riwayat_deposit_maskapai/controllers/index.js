const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

controllers.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.info_add_deposit = async (req, res) => {
 
  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.info_add_deposit();
    res.status(200).json({ error: false, data : feedBack });
  } catch (error) {
    console.log("0000____0000");
    console.log(error);
    console.log("0000____0000");
    handleServerError(res, error.message);
  }
};

controllers.add_deposit = async ( req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add_deposit();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Deposit Maskapai berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Deposit Maskapai gagal ditambahkan.',
      });
    }
  } catch (error) {
    console.log("0000____0000");
    console.log(error); 
    console.log("0000____0000");
    handleServerError(res, error.message);
  }
}


controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;  

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Riwayat deposit maskapai berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Riwayat deposit maskapai gagal ditambahkan.',
      });
    }
  } catch (error) {
    console.log("0000____0000||||||||");
    console.log(error); 
    console.log("0000____0000||||||||");
    handleServerError(res, error.message);
  }
}

// // *Menambahkan kota*
// controllers.add = async (req, res) => {
//   if (!(await handleValidationErrors(req, res))) return;

//   try {
//     const model_cud = new Model_cud(req);
//     await model_cud.add();

//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: 'Kota berhasil ditambahkan.',
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: 'Kota gagal ditambahkan.',
//       });
//     }
//   } catch (error) {
//     handleServerError(res, error.message);
//   }
// };

// // *Update kota*
// controllers.update = async (req, res) => {
//   if (!(await handleValidationErrors(req, res))) return;

//   try {
//     const model_cud = new Model_cud(req);
//     await model_cud.update();

//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: 'Kota berhasil diupdate.',
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: 'Kota gagal diupdate.',
//       });
//     }

//   } catch (error) {
//     handleServerError(res, error.message);
//   }
// };

// // *Hapus kota*
// controllers.delete = async (req, res) => {
//   if (!(await handleValidationErrors(req, res))) return;

//   try {
//     const model_cud = new Model_cud(req);
//     await model_cud.delete();

//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: 'Kota berhasil dihapus.',
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: 'Kota gagal dihapus.',
//       });
//     }
//   } catch (error) {
//     handleServerError(res, error.message);
//   }
// };

module.exports = controllers;
