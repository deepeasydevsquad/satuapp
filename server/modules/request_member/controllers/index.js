const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// *Mendapatkan daftar request member*
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

// *Menyetujui request member*
controllers.setujuiRequestMember = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.setujuiRequestMember();
    // response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Request member berhasil disetujui.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Request member gagal disetujui.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Menolak request member*
controllers.rejectRequestMember = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.rejectRequestMember();
    // response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Request member berhasil ditolak.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Request member gagal ditolak',
      });
    }
  } catch (error) {

    console.log("------XXXXX-----");
    console.log(error);
    console.log("------XXXXX-----");
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
