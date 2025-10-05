const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// *Mendapatkan daftar fasilitas*
controllers.getDaftarFasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_fasilitas();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Menambahkan fasilitas*
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Fasilitas berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Fasilitas gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Update fasilitas*
controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Fasilitas berhasil diupdate.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Fasilitas gagal diupdate.',
      });
    }

  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Hapus fasilitas*
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Fasilitas berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Fasilitas gagal dihapus.',
      });
    }
  } catch (error) {
    console.log("dddddd");
    console.log(error);
    console.log("dddddd");
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
