const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.getAgen = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getAgen();
    res.status(200).json({ error: false, data: feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.getInfoMember = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getInfoMember();
    res.status(200).json({ error: false, data: feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.getMemberNotJamaah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getMemberNotJamaah();
    res.status(200).json({ error: false, data: feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.getJamaahNotMember = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getJamaahNotMember();
    res.status(200).json({ error: false, data: feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.getJamaah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.daftar_jamaah();
    res.status(200).json({ error: false, data: feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.addJamaah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  
  try {
    const model_cud = new Model_cud(req);
    await model_cud.tambahJamaah(); 

    if (await model_cud.response()) { 
      res.status(200).json({ 
        error: false,
        error_msg: 'Daftar jamaah berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({ 
        error: true,
        error_msg: 'Daftar jamaah gagal ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.getInfoUpdate = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getInfoUpdate();
    res.status(200).json({ error: false, data: feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.editJamaah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.editJamaah(); // insert feedBack

    if (await model_cud.response()) { 
      res.status(200).json({ 
        error: false,
        error_msg: 'Daftar jamaah berhasil diupdate.',
      });
    } else {
      res.status(400).json({ 
        error: true,
        error_msg: 'Daftar jamaah gagal diupdate.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.deleteJamaah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    await model_cud.deleteJamaah(); // insert feedBack

    if (await model_cud.response()) { 
      res.status(200).json({ 
        error: false,
        error_msg: 'Daftar jamaah berhasil dihapus.',
      });
    } else {
      res.status(400).json({ 
        error: true,
        error_msg: 'Daftar jamaah gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.downloadJamaah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    await model_r.download_jamaah_excel(req, res); 
  } catch (error) {
    handleServerError(res, error.message);
  }
};

