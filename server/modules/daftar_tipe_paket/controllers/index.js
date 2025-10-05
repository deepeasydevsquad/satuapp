const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// **Mendapatkan daftar tipe paket**
controllers.get_daftar_tipe_paket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_tipe_paket(); // Ambil daftar tipe paket dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// **Menambahkan tipe paket baru**
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Tipe Paket Baru berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Tipe Paket Baru Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// **Update tipe_paket**
controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Tipe Paket berhasil Diupdate.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Tipe Paket Gagal Diupdate.',
      });
    }

  } catch (error) {
    console.error("Error di Controller:", error);
    handleServerError(res, error.message);
  }
};

// **Hapus tipe_paket**
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Tipe Paket berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Tipe Paket Gagal Dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
