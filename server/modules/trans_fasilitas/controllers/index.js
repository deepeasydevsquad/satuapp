const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleServerError, handleValidationErrors } = require("../../../helper/handleError");

const controllers = {};

controllers.add_transaksi_fasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.tambah_transaksi_fasilitas();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Transaksi berhasil dibuat",
        invoice: model.invoice,
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat Transaksi",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat Transaksi Fee:", error);
    handleServerError(res, error);
  }
};

controllers.hapus_transaksi_fasilitas = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.hapus_transaksi_fasilitas();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Transaksi berhasil dibuat",
        invoice: model.invoice,
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat Transaksi",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat Transaksi Fee:", error);
    handleServerError(res, error);
  }
};

controllers.daftar_transaksi_fasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const data = await new Model_r(req).daftar_transaksi_fasilitas();
    res.status(200).json({ error: false, data: data.data, total: data.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.daftar_customer = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_kostumer();
    res.status(200).json({ error: false, data: data });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.daftar_paket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const data = await new Model_r(req).daftar_paket();
    res.status(200).json({ error: false, data: data });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.daftar_fasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const data = await new Model_r(req).daftar_fasilitas();
    res.status(200).json({ error: false, data: data });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;