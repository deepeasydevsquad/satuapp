const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleServerError, handleValidationErrors } = require("../../../helper/handleError");

exports.hapus = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_cud(req);
    await model.hapus();

    if (await model.response()) {
      res.status(200).json({
        message: "Proses hapus data peminjaman berhasil dilakukan.",
        error: false,
      });
    } else {
      res.status(400).json({
        message: "Proses hapus data peminjaman gagal dilakukan.",
        error: true
      });
    }
  } catch (error) {
    console.log("CCCCC");
    console.log(error);
    console.log("CCCCC");
    handleServerError(res, error);
  }
}

exports.get_sumber_dana = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_r(req);
    const data = await model.get_sumber_dana();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.addPinjaman = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.createPeminjaman();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Peminjaman berhasil dibuat",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat peminjaman",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat addPinjaman:", error);
    handleServerError(res, error);
  }
};

exports.daftarPinjaman = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_r(req);
    const data = await model.daftarPeminjaman();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.SkemaByID = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) {
    console.log("❌ Validasi gagal");
    return;
  }

  try {
    const model = new Model_r(req);
    const data = await model.getSkemaPeminjmanByID();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_jamaah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) {
    return;
  }

  try {
    const model = new Model_r(req);
    const data = await model.daftar_jamaah();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.updateSkema = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.updateSkema();
    // const success = ;

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "skema berhasil di update",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal update skema peminjaman",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat update Skema Peminjaman:", error);
    handleServerError(res, error);
  }
};

exports.pembayaranPerbulan = async (req, res) => {
  const model = new Model_cud(req, res); // Pass both req and res to the constructor
  try {
    await model.pembayaranPerbulan(); // Operasikan pembayaran per bulan di model

    // Mengirim respons berdasarkan status setelah pembayaran perbulan
    const success = await model.response();

    if (success) {
      res.status(200).json({
        message: model.message || "Pembayaran perbulan berhasil dibuat",
        status: "success",
        invoice: model.invoice, // Mengirim invoice yang dihasilkan
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal bayar pembayaran perbulan",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat bayar pembayaran perbulan:", error);
    handleServerError(res, error);
  }
};

exports.downloadDataPeminjaman = async (req, res) => {
  try {
    const model = new Model_r(req);
    await model.downloadDataPeminjaman(req, res);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
