const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");


const controllers = {};

controllers.filter = async (req, res) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.filter();
    res.status(200).json({ error: false, data : feedBack });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.server_side = async (req, res) => {
  
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feed = await model_r.server_side();

    if( Object.keys(feed).length > 0 ) {
      res.status(200).json({ error: false, data : feed.data, total : feed.total });
    }else{
      res.status(400).json({ error: true, error_msg: 'Gagal.' });
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
      res.status(200).json({ error: false, error_msg: 'Jurnal berhasil dihapus.' });
    } else {
      res.status(400).json({ error: true, error_msg: 'Akun gagal dihapus.', });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
}

module.exports = controllers;
