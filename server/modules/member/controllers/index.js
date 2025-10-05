const Model_cud = require("../models/model_cud");
// const { handleServerError } = require("../../../helper/handleError");
const Model_r = require("../models/model_r");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

exports.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.list();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.infoEditMember = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.infoEditMember();  
    if( Object.keys(data).length > 0 ) {
      res.status(200).json({ error: false, error_message: 'Data berhasil ditemukan', data : data });
    }else{
       res.status(400).json({ error: true, error_message: 'Data Gagal ditemukan'});
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.getType = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.getTipe();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const model = new Model_cud(req);
    const data = await model.add();
    res.status(data.success ? 200 : 400).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const model = new Model_cud(req);
    // update process
    await model.update();
     // get response
    if (await model.response()) {
      res.status(200).json({ error: false, error_msg: 'Data Member Berhasil Diperbaharui.' });
    } else {
      res.status(400).json({ error: true, error_msg: 'Data Member Gagal Diperbaharui.' });
    }
    // res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const model = new Model_cud(req);
    // delete process
    await model.delete();
     // get response
    if (await model.response()) {
      res.status(200).json({ error: false, error_msg: 'Data Member Berhasil Dihapus.' });
    } else {
      res.status(400).json({ error: true, error_msg: 'Data Member Gagal Dihapus.' });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.getDaftarCabang = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.getDaftarCabang();
    if( Object.keys(data).length > 0 ) {
      res.status(200).json({ error : false, error_msg : 'Sukses', data: data });
    }else{
      res.status(200).json({ error : true, error_msg : 'Error' });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.level_agen = async ( req, res ) => {

   try {
    
    const model = new Model_r(req);
    const data = await model.get_level_agen();

    console.log('xxxx');
    console.log(data);
    console.log('xxxx');

    if( data.length > 0 ) {
      res.status(200).json({ error : false, error_msg : 'Sukses', data: data });
    }else{
      res.status(200).json({ error : true, error_msg : 'Error' });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.makeAnAgen = async ( req, res ) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.makeAnAgen();
     // get response
    if (await model.response()) {
      res.status(200).json({ error: false, error_msg: 'Data Member Berhasil Dihapus.' });
    } else {
      res.status(400).json({ error: true, error_msg: 'Data Member Gagal Dihapus.' });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

exports.listUpline = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.listUpline();
    // feedBack
    if( data.length > 0 ) {
      res.status(200).json({ error : false, error_msg : 'Sukses', data: data });
    }else{
      res.status(200).json({ error : true, error_msg : 'Error' });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}