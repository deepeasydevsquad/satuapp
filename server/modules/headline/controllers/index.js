const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// Mendapatkan daftar headline
controllers.daftarHeadline = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftarHeadline(); // Ambil daftar headline dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Menambah headline
controllers.addHeadline = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.addHeadline(); // Ambil daftar headline dari model
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Headline berhasil ditambahkan.',
      }); 
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Headline gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.fetchHeadline = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.fetchHeadline(); // Ambil daftar headline dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengupdate headline
controllers.updateHeadline = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.updateHeadline(); // Ambil daftar headline dari model
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Headline berhasil diupdate.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Headline gagal diupdate.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Menghapus headline
controllers.deleteHeadline = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.deleteHeadline(); // Ambil daftar headline dari model
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Headline berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Headline gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;

