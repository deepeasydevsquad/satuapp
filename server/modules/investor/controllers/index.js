const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// **Mendapatkan daftar investor**
controllers.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list(); // Ambil daftar investor dari model
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// **Menambahkan investor baru**
controllers.add = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Investor Baru berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Investor Baru Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// **Update airline**
controllers.update = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.update();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Investor berhasil Diupdate.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Investor Gagal Diupdate.',
      });
    }

  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.infoAdd = async ( req, res ) => {
   try {
      const model_r = new Model_r(req);
      const feedBack = await model_r.getCabang(); // Ambil daftar airline dari model
      res.status(200).json({ error: false, data : feedBack });
   } catch (error) {
      res.status(400).json({
        error: true,
        error_msg: 'Info tidak ditemukan.',
      });
   }
}

controllers.infoEdit = async ( req, res ) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
      const model_r = new Model_r(req);
      const infoInvestor = await model_r.getInvestor();
      res.status(200).json({ error: false, data : infoInvestor });
  } catch (error) {
      res.status(400).json({
        error: true,
        error_msg: 'Info tidak ditemukan.',
      });
  }
}

controllers.delete = async ( req, res ) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.delete();
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Investor berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Investor gagal dihapus.',
      });
    }

  } catch (error) {
    handleServerError(res, error.message);
  }
}

module.exports = controllers;
