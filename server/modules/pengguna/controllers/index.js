const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleServerError, handleValidationErrors } = require("../../../helper/handleError");

exports.getPengguna = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.daftar_pengguna();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.addPengguna = async (req, res) => {

  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    // proses menambahk pengguna
    await model.tambahPengguna();
    // get response
    if ( await model.response() ) {
      res.status(200).json({
        error: false,
        error_msg: 'Pengguna baru berhasil ditambahkan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Pengguna Baru Gagal Ditambahkan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// ✅ KELUARKAN FUNGSI INI DARI DALAM `addPengguna`
exports.editPengguna = async (req, res) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.editPengguna();
    // get response
    if ( await model.response() ) {
      res.status(200).json({
        error: false,
        error_msg: 'Proses update pengguna berhasil dilakukan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Proses update pengguna gagal dilakukan.',
      });
    }
    // res.status(data.success ? 200 : 400).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.deletePengguna = async (req, res) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.hapusPengguna();
    // get response
    if ( await model.response() ) {
      res.status(200).json({
        error: false,
        error_msg: 'Proses menghapus pengguna berhasil dilakukan.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Proses menghapus pengguna gagal dilakukan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};


exports.get_member = async (req, res) => {
  try {

    const model = new Model_r(req);
    const data = await model.get_member();
    if( data.length > 0 ) {
      res.status(200).json({ 
        error: false, 
        error_message: 'Data member berhasil ditemukan', 
        data : data 
      });
    }else{
      res.status(400).json({ 
        error: true, 
        error_message: 'Data member tidak ditemukan', 
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.get_grup = async (req, res) => {
  try {

    const model = new Model_r(req);
    const data = await model.get_grup();
    if( data.length > 0 ) {
      res.status(200).json({ 
        error: false, 
        error_message: 'Data grup berhasil ditemukan', 
        data : data 
      });
    }else{
      res.status(400).json({ 
        error: true, 
        error_message: 'Data grup tidak ditemukan', 
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.get_info_edit_pengguna = async (req, res) => {

  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    // proses menambahk pengguna
    const data = await model.get_info_edit_pengguna();
    // get response
    if ( Object.keys(data).length > 0  ) {
      res.status(200).json({
        error: false,
        error_msg: 'Info edit pengguna berhasil ditemukan.',
        data: data
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Info edit pengguna gagal ditemukan.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};
