const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// Mendapatkan status card untuk beranda utama
controllers.statusCard = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.statusCard(); // Ambil status card dari model
    res.status(200).json({ error: false, data: feedBack });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Mendapatkan daftar jamaah terdaftar
controllers.daftarJamaah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftarJamaah(); // Ambil daftar jamaah dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mendapatkan daftar headline
controllers.daftarHeadline = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftarHeadline(); // Ambil daftar headline dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Menghapus headline
controllers.deleteHeadline = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.deleteHeadline(); // Ambil daftar headline dari model
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Headline berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Headline gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mendapatkan daftar permintaan deposit member
controllers.daftarPermintaanDepositMember = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftarPermintaanDepositMember(); // Ambil daftar deposit member dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.updateStatusRequestDepositMember = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req); 
    await model_cud.updateStatusRequestDepositMember(); // Update status deposit member
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Status permintaan deposit member berhasil diperbarui.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Status permintaan deposit member gagal diperbarui.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.deleteRequestDepositMember = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.deleteRequestDepositMember(); // Hapus permintaan deposit member
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Permintaan deposit member berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Permintaan deposit member gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;

