const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.add_pembayaran = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.add();

    if (await model.response()) {
      res.status(201).json({
        message: model.message || "Gaji Berhasil Di Bayar",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal Membayar Gaji ",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat addPinjaman:", error);
    handleServerError(res, error);
  }
};

exports.delete_pembayaran = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.delete();

    if (await model.response()) {
      res.status(201).json({
        message: model.message || "Gaji Berhasil Di hapus",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal Menghapus Gaji ",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat addPinjaman:", error);
    handleServerError(res, error);
  }
};

exports.daftar_pembayaran_gaji = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_r(req);
    const data = await model.daftar_pembayaran_gaji();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.daftar_staff_sumber_dana = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_r(req);
    const data = await model.daftar_staff_sumber_dana();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
