const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.daftar_produk = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.daftar_produk();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.add_markup = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.tambah_markup();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "markup berhasil dibuat",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat markup",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat addPinjaman:", error);
    handleServerError(res, error);
  }
};

exports.hapus_markup = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.hapus_markup();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "markup berhasil dibuat",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat markup",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat addPinjaman:", error);
    handleServerError(res, error);
  }
};
