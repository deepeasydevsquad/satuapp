const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const controllers = {};

// *Mendapatkan daftar perusahaan*
controllers.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list();
    res
      .status(200)
      .json({ error: false, data: feedBack.data, total: feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Menambahkan perusahaan*
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Perusahaan berhasil ditambahkan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Perusahaan gagal ditambahkan.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Update perusahaan*
controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Data perusahaan berhasil diupdate.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Data perusahaan gagal diupdate.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Hapus perusahaan*
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Data perusahaan berhasil dihapus.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Data perusahaan gagal dihapus.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.get_data_edit_perusahaan = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.get_data_edit_perusahaan();
    res.status(200).json({ error: false, data: feedBack });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.add_waktu_berlangganan = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add_waktu_berlangganan();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Waktu berlangganan perusahaan berhasil ditambah.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Waktu berlangganan perusahaan gagal ditambah.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.tambah_saldo = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.tambah_saldo();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Saldo perusahaan berhasil ditambah.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Saldo perusahaan gagal ditambah.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
