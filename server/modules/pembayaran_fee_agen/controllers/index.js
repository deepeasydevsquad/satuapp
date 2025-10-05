const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.add_pembayaran_agen = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.bayar_fee_agen();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Pembayaran berhasil dibuat",
        invoice: model.invoice,
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat Pembayaran",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat Pemabayran Fee:", error);
    handleServerError(res, error);
  }
};

exports.get_data_fee = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.fee_agen_by_id();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.detail_pembayaran_fee = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.detail_fee_agen();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.data_agen = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.daftar_agen();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.daftar_pembayaran_fee_agen = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.daftar_pembayaran_fee_agen();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
