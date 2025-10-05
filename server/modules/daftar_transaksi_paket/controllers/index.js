const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// Mendapatkan daftar jamaah transaksi paket
controllers.getJamaahTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getJamaahTransaksiPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mendapatkan daftar agen transaksi paket
controllers.getAgenTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getAgenTransaksiPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mendapatkan daftar paket transaksi paket
controllers.getPaketTypes = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getPaketTypes();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mendapatkan daftar transaksi paket
controllers.getDaftarTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftarTransaksiPaket(); // Ambil daftar transaksi paket dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total, status: feedBack.status });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Menambahkan transaksi paket baru
controllers.addTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const invoice = await model_cud.addTransaksiPaket();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Transaksi Paket Baru berhasil ditambahkan.',
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Transaksi Paket Baru Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Update Visa Transaksi Paket
controllers.updateVisaTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.updateVisaTransaksiPaket();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Visa Transaksi Paket berhasil diupdate',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Visa Transaksi Paket gagal diupdate',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Info info VisaTransaksiPaket
controllers.infoupdateVisaTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.infoupdateVisaTransaksiPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Refund Paket Transaksi Paket
controllers.refundTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.refundTransaksiPaket();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Transaksi Paket berhasil direfund.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Transaksi Paket Gagal Direfund.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Info info RefundTransaksiPaket
controllers.inforefundTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  
  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.inforefundTransaksiPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Hapus Paket Transaksi Paket
controllers.deleteTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.deleteTransaksiPaket();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Transaksi Paket berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Transaksi Paket Gagal Dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil daftar Jamaah Transaksi Paket
controllers.getJamaahTransaksiPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getJamaahTransaksiPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil daftar Paket Transaksi Paket
controllers.getPaketTypes = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getPaketTypes();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil daftar Agen berdasarkan ID*/
controllers.getAgenById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getAgenById();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mengambil cetak data jamaah berdasarkan ID Transaksi Paket
controllers.getCetakDataJamaahTabunganUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getCetakDataJamaahTabunganUmrah();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;

