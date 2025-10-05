const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.addKonfigurasi = async (req, res) => {
  console.log("addKonfigurasi");
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.addKonfigurasiSuratMenyurat();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Konfigurasu berhasil dibuat",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat Konfigurasi",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat addPinjaman:", error);
    handleServerError(res, error);
  }
};

exports.addSurat = async (req, res) => {
  console.log("addKonfigurasi");
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_cud(req);
    await model.addSurat();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Konfigurasu berhasil dibuat",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat Konfigurasi",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat addPinjaman:", error);
    handleServerError(res, error);
  }
};

exports.deleteSurat = async (req, res) => {
  console.log("addKonfigurasi");
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_cud(req);
    await model.deleteSurat();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Delete berhasil dibuat",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal delete Konfigurasi",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat addPinjaman:", error);
    handleServerError(res, error);
  }
};

exports.get_konfigurasi = async (req, res) => {
  try {
    const data = await new Model_r(req).get_konfigurasi_surat();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_daftar_jamaah = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_jamaah();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_riwayat_surat = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_riwayat_surat();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.cetak_surat = async (req, res) => {
  try {
    const data = await new Model_r(req).cetak_surat();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
