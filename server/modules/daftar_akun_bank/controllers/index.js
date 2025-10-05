const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const controllers = {};

// *Mendapatkan daftar kota*
controllers.daftar_bank = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_bank();
    res
      .status(200)
      .json({ error: false, data: feedBack.data, total: feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.bank_by_id = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.detail_bank();
    res.status(200).json({ error: false, data: feedBack });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.daftar_mst_bank = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_mst_bank();
    res.status(200).json({ error: false, data: feedBack });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Menambahkan kota*
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Bank berhasil ditambahkan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Bank gagal ditambahkan.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Update Bank*
controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Bank berhasil diupdate.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Bank gagal diupdate.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Hapus Bank*
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Bank berhasil dihapus.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Bank gagal dihapus.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
