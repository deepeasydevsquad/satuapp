const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

exports.list = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.list();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.addAgen = async (req, res) => {
  try {
    const model = new Model_cud(req);
    const data = await model.tambahAgen();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.delete = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_cud(req);
    await model.delete();
    // get response
    if (await model.response()) {
      res.status(200).json({
        error: false,
        error_msg: 'Agen berhasil dihapus.',
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: 'Agen gagal dihapus.',
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};
