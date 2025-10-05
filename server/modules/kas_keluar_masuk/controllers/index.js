const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// dapatkan list akun
controllers.getAkun = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const hotels = await model_r.getAkun();
    res.status(200).json({ error: false, error_msg: 'Berhasil', data: hotels });
  } catch (error) {

    handleServerError(res, error.message);
  }
};

// proses input kas keluar masuk baru
controllers.addKasKeluarMasuk = async (req, res) => {

  if (!(await handleValidationErrors(req, res))) return;

  try {
      const model = new Model_cud(req);
      const invoice = await model.add_kas_keluar_masuk();      // get response
      if (await model.response()) {
        res.status(200).json({ error: false, error_msg: 'Kas Keluar Masuk Berhasil Disimpan.', data: invoice });
      } else {
        res.status(400).json({ error: true, error_msg: 'Kas Keluar Masuk Gagal Disimpan.' });
      }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// dapatkan list kas keluar masuk
controllers.list = async (req, res) => {

  if (!(await handleValidationErrors(req, res))) return;

  try {
      const model = new Model_r(req);
      const data = await model.list(); // get response

      if (data.data !== undefined) {
        res.status(200).json({ error: false, error_msg: 'Daftar data kas keluar masuk berhasil ditemukan.', data: data.data, total: data.total });
      } else {
        res.status(400).json({ error: true, error_msg: 'Daftar data kas keluar masuk gagal ditemukan.' });
      }
  } catch (error) {
    handleServerError(res, error.message);
  }
}


controllers.delete = async ( req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
      const model = new Model_cud(req);
      await model.delete(); // get response
      // response
      if (await model.response()) {
        res.status(200).json({ error: false, error_msg: 'Proses Delete Kas Keluar Masuk Berhasil Dilakukan.' });
      } else {
        res.status(400).json({ error: true, error_msg: 'Proses Delete Kas Keluar Masuk Gagal Dilakukan.' });
      }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

module.exports = controllers;
