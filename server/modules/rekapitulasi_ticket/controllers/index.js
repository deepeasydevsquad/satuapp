const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

controllers.getTicketTersedia = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_r = new Model_r(req);
    const tickets = await model_r.getTicketTersedia();
    res.status(200).json({ error: false, data: tickets });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.daftarRekapitulasiTicket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftarTicketRekapitulasi();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.addRekapitulasi = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    const registrationNumber = await model_cud.addRekapitulasiTicket();
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: `Rekapitulasi Tiket ${registrationNumber} berhasil ditambahkan.`,
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Rekapitulasi Tiket Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.deleteRekapitulasi = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    await model_cud.deleteRekapitulasiTicket();
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Rekapitulasi Tiket berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Rekapitulasi Tiket Gagal Dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.cetakDataRekapByRegnumb = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_r = new Model_r(req);
    const rekapitulasi = await model_r.cetakDataRekapByRegnumb();
    if (rekapitulasi) {
      res.status(200).json({ error: false, data: rekapitulasi });
    } else {
      res.status(404).json({ error: true, error_msg: "Rekapitulasi tidak ditemukan." });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;

