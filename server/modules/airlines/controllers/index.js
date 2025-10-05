const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// *Mendapatkan daftar airline*
controllers.getDaftarAirlines = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_airlines();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Menambahkan airline*
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Maskapai berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Maskapai gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Update airline*
controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Maskapai berhasil diupdate.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Maskapai gagal diupdate.',
      });
    }

  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Hapus airline*
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Maskapai berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Maskapai gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
