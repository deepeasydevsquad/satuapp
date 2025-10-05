const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");


const controllers = {};

controllers.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_r = new Model_r(req);
    const feed = await model_r.list();
    if( Object.keys(feed).length > 0 ) {
      res.status(200).json({ error: false, data : feed.data });
    }else{
      res.status(400).json({ error: true, error_msg: 'Gagal.' });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.tutupPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    await model_cud.tutupPaket();
    if (await model_cud.response()) {
      res.status(200).json({ error: false, error_msg: 'Proses tutup paket berhasil dilakukan.' });
    } else {
      res.status(400).json({ error: true, error_msg: 'Proses tutup paket gagal dilakukan.', });
    }
  } catch (error) {
    console.log("xxxxxffff");
    console.log(error);
    console.log("xxxxxffff");
    handleServerError(res, error.message);
  }
}

controllers.bukaPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    await model_cud.bukaPaket();
    if (await model_cud.response()) {
      res.status(200).json({ error: false, error_msg: 'Proses buka paket berhasil dilakukan.' });
    } else {
      res.status(400).json({ error: true, error_msg: 'Proses buka paket gagal dilakukan.', });
    }
  } catch (error) {
    console.log("xxxxxDDDDDDDf");
    console.log(error);
    console.log("xxxxxDDDDDDDf");
    handleServerError(res, error.message);
  }
}

// controllers.filter = async (req, res) => {
  
//   if (!(await handleValidationErrors(req, res))) return;

//   try {
//     const model_r = new Model_r(req);
//     const feedBack = await model_r.filter();
//     res.status(200).json({ error: false, data : feedBack });
//   } catch (error) {
//     handleServerError(res, error.message);
//   }
// };

// controllers.delete = async ( req, res) => {

//   if (!(await handleValidationErrors(req, res))) return;

//   try {
//     const model_cud = new Model_cud(req);
//     await model_cud.delete();
//     // get response
//     if (await model_cud.response()) {
//       res.status(200).json({ error: false, error_msg: 'Jurnal berhasil dihapus.' });
//     } else {
//       res.status(400).json({ error: true, error_msg: 'Akun gagal dihapus.', });
//     }
//   } catch (error) {
//     handleServerError(res, error.message);
//   }
// }

module.exports = controllers;
