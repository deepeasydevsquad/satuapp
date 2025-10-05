const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// **Mendapatkan daftar paket_la**
controllers.get_fasilitas_paket_la = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.fasilitas_paket_la(); // Ambil daftar paket_la dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// **Menambahkan multiple fasilitas paket LA**
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    // Validate that items array exists and is not empty
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        error: true,
        error_msg: 'Data items fasilitas paket LA tidak valid atau kosong.',
      });
    }

    const model_r = new Model_r(req);
    const total_price = await model_r.total_price();
    const model_cud = new Model_cud(req);
    await model_cud.add(total_price);
    
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Fasilitas Paket LA berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Fasilitas Paket LA Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// // **Update paket_la**
// controllers.update = async (req, res) => {
//   if (!(await handleValidationErrors(req, res))) return;

//   try {
//     const model_cud = new Model_cud(req);
//     await model_cud.update();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({
//         error: false,
//         error_msg: 'Paket LA berhasil Diupdate.',
//       });
//     } else {
//       res.status(400).json({
//         error: true,
//         error_msg: 'Paket LA Gagal Diupdate.',
//       });
//     }

//   } catch (error) {
//     console.error("Error di Controller:", error);
//     handleServerError(res, error.message);
//   }
// };

// **Hapus paket_la**
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);

    const body = req.body;
    const infoFasilitas =  await model_r.infoFasilitasPaketLA(body.fasilitaspaketlaId);
    const total_price = await model_r.total_price(infoFasilitas.paket_la_id);
    const model_cud = new Model_cud(req);
    await model_cud.delete(total_price);

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Paket LA berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Paket LA Gagal Dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
