const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

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

