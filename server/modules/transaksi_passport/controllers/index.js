const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const controllers = {};

// FUNGSI UNTUK MENGAMBIL DATA LIST
controllers.getDaftarTransaksiPassport = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_transaksi_passport();
    res
      .status(200)
      .json({ error: false, data: feedBack.data, total: feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getAllCities = async (req, res) => {
  try {
    const model = new Model_r(req);
    const cities = await model.getAllCities();
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Fungsi Penambahan
controllers.addNewTransaksiPassport = async (req, res) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();
    const success = await model_cud.response();
    if (success) {
      res.status(201).json({
        success: true,
        error: false,
        message: model_cud.message || "Data berhasil ditambahkan",
      });
    } else {
      throw new Error("Gagal menyimpan data transaksi Passport.");
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.deleteTransaksiPassport = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const { id } = req.params;
    const model_cud = new Model_cud(req);
    await model_cud.hapus(id);
    const success = await model_cud.response();

    if (success) {
      res.status(200).json({
        success: true,
        error: false,
        message: model_cud.message || "Data berhasil dihapus",
      });
    } else {
      res.status(400).json({
        success: false,
        error: true,
        message:
          model_cud.message || "Gagal menghapus data transaksi Passport.",
      });
    }
  } catch (error) {
    console.log("-------");
    console.log(error);
    console.log("-------");
    handleServerError(res, error.message);
  }
};

controllers.daftar_paket = async (req, res) => {
  try {
    const model = new Model_r(req);
    const cities = await model.daftar_paket();
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.daftar_kostumer = async (req, res) => {
  try {
    const model = new Model_r(req);
    const cities = await model.daftar_kostumer();
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
