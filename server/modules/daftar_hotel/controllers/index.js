const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

controllers.getDaftarKota = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_kota();

    res.status(200).json({ error: false, data: feedBack.data, total: feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

// **Mendapatkan daftar hotel**
controllers.getDaftarHotel = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_hotel();

    res.status(200).json({ error: false, data: feedBack.data, total: feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Menambahkan hotel*
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();

    if (await model_cud.response()) {
      res.status(200).json({ 
        error: false, 
        error_msg: "Hotel berhasil ditambahkan." 
      });
    } else {
      res.status(400).json({ 
        error: true, 
        error_msg: "Hotel gagal ditambahkan." 
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Update hotel*
controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();

    if (await model_cud.response()) {
      res.status(200).json({ 
        error: false, 
        error_msg: "Hotel berhasil diupdate." 
      });
    } else {
      res.status(400).json({ 
        error: true, 
        error_msg: "Hotel gagal diupdate." 
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// *Hapus hotel*
controllers.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();

    if (await model_cud.response()) {
      res.status(200).json({ 
        error: false, 
        error_msg: "Hotel berhasil dihapus." 
      });
    } else {
      res.status(400).json({ 
        error: true, 
        error_msg: "Hotel gagal dihapus." 
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
