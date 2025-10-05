const Model_r = require("../models/model_r");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// Mendapatkan daftar transaksi paket
controllers.getDaftarManifestPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftarManifestPaket(); // Ambil daftar transaksi paket dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total, status: feedBack.status });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Download manifest paket
controllers.downloadManifestPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    await model_r.downloadManifestPaket(res);
  } catch (error) {
    handleServerError(res, error.message);
  }
}

module.exports = controllers;

