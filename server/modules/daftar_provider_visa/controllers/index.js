const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// *Mendapatkan daftar provider_visa*
controllers.getDaftarProviderVisa = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_provider_visa();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Menambahkan provider_visa*
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Provider Visa berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Provider Visa gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Update provider_visa*
controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Provider Visa berhasil diupdate.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Provider Visa gagal diupdate.',
      });
    }

  } catch (error) {
    
    handleServerError(res, error.message);
  }
};

// *Hapus provider_visa*
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Provider Visa berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Provider Visa gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
