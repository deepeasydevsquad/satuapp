const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const controllers = {};

// *Mendapatkan daftar request member*
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

controllers.listBankTransfer = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.listBankTransfer();
    res.status(200).json({ error: false, data: feedBack.data });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Menyetujui request tambah saldo*
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();
    // response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Request tambah saldo perusahaan berhasil dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Request tambah saldo perusahaan gagal dilakukan.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.get_info_edit = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.get_info_edit();
    res.status(200).json({ error: false, data: feedBack.data });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();

    // response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Update request tambah saldo perusahaan berhasil dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Update request tambah saldo perusahaan gagal dilakukan.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    // response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg:
          "Proses delete request tambah saldo perusahaan berhasil dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg:
          "Proses delete request tambah saldo perusahaan gagal dilakukan.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.sudah_dikirim = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    await model_cud.sudah_dikirim();
    // response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Update status kirim deposit berhasil dilakukan.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Update status kirim deposit gagal dilakukan.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
