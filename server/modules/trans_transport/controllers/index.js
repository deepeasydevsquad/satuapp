const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.add_transaksi_transport = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.tambah_transaksi_transport();

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

exports.hapus_transaksi_transport = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.hapus_transaksi_transport();

    if (await model.response()) {
      res.status(200).json({
        message: model.message,
        error: false,
      });
    } else {
      res.status(400).json({
        message: model.message,
        error: true
      });
    }
  } catch (error) {
    console.error("Terjadi error saat Transaksi transport:", error);
    handleServerError(res, error);
  }
};

exports.daftar_transaksi_transport = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_transaksi_transport();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.daftar_mobil = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_mobil();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.daftar_customer = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_kostumer();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.daftar_paket = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_paket();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
