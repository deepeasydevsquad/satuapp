const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// Mendapatkan data kwintansi data jamaah
controllers.getCetakDataJamaahPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getCetakDataJamaahPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Mendapatkan data daftar absensi jamaah
controllers.getCetakAbsensiJamaahPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getCetakAbsensiJamaahPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Mendapatkan petugas jamaah
controllers.getPetugasJamaahPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getPetugasJamaahPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Mendapatkan daftar transaksi paket
controllers.getDaftarJamaahPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftarJamaahPaket(); // Ambil daftar transaksi paket dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total, status: feedBack.status });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mendapatkan daftar fasilitas paket
controllers.getMstFasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getMstFasilitas();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Mendapatkan handover fasilitas berdasarkan ID transpaket
controllers.getHandoverFasilitasById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getHandoverFasilitasById();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Menambahkan handover fasilitas
controllers.addHandoverFasilitasPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const invoice = await model_cud.addHandoverFasilitasPaket();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Handover Fasilitas Tabungan Umrah berhasil ditambahkan.',
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Handover Fasilitas Tabungan Umrah Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    console.log("xxxxxxxxxxxxxxxxx");
    console.log(error);
    console.log("xxxxxxxxxxxxxxxxx");
    handleServerError(res, error.message);
  }
}

// Menambahkan handover barang
controllers.addHandoverBarangPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const invoice = await model_cud.addHandoverBarangPaket();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Handover Barang Paket berhasil ditambahkan.',
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Handover Barang Paket Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Melakukan pengembalian handover
controllers.pengembalianHandoverBarangPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const invoice = await model_cud.pengembalianHandoverBarangPaket();

    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Pengembalian Handover Barang Paket berhasil ditambahkan.',
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Pengembalian Handover Barang Paket Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// Mendapatkan handover barang berdasarkan id
controllers.getInfoPengembalianHandoverBarangPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getInfoPengembalianHandoverBarangPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

module.exports = controllers;

