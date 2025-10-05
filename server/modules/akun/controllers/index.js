const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleValidationErrors2, handleServerError } = require("../../../helper/handleError");

const controllers = {};

controllers.filter_akun = async (req, res) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.filter_akun();
    res.status(200).json({ error: false, data : feedBack });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.get_daftar_akun = async (req, res) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.get_daftar_akun();
    res.status(200).json({ error: false, data : feedBack.data });
  } catch (error) {  
    handleServerError(res, error.message);
  }
}

controllers.check_akun = async (req, res) => {
  
  if (!(await handleValidationErrors2(req, res))) return;

  try {
    res.status(200).json({ error: false });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.add = async (req, res) => {

  if (!(await handleValidationErrors2(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Akun Baru berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Akun Baru Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.edit = async (req, res) => {

  if (!(await handleValidationErrors2(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Data Akun berhasil diupdate.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Data akun gagal diupdate.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.delete = async ( req, res) => {

  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Akun berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Akun gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.update_saldo = async ( req, res ) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update_saldo();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Proses update saldo akun berhasil dilakukan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Proses update saldo akun gagal dilakukan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.tutup_buku = async (req, res) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.tutup_buku();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Proses tutup buku berhasil dilakukan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Proses tutup buku gagal dilakukan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.kembalikan_buku = async (req, res) => {

  try {
    const model_r = new Model_r(req);
    if( await model_r.count_periode() >= 1) {
      const model_cud = new Model_cud(req);
      await model_cud.kembalikan_buku();
      // get response
      if (await model_cud.response()) {
        res.status(200).json({
          error: false,
          error_msg: 'Proses pengembalian buku berhasil dilakukan.',
        });
      } else {
        res.status(400).json({
          error: true,
          error_msg: 'Proses pengembalian buku gagal dilakukan.',
        });
      }
    }else{
      res.status(400).json({
        error: true,
        error_msg: 'Periode Sebelumnya tidak ditemukan..',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

module.exports = controllers;
