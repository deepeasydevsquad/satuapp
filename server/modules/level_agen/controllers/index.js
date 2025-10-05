const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

exports.daftarLevelAgen = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.list();
    res.status(200).json(data);
  } catch (error) {
    console.log("******----------------");
    console.log(error);
    console.log("******************");
    handleServerError(res, error.message);
  }
};

exports.addAgen = async (req, res) => {
  try {
    const model = new Model_cud(req);
    const data = await model.add();
    res.status(data.success ? 200 : 400).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.updateAgen = async (req, res) => {
  try {
    const model = new Model_cud(req);
    const data = await model.update();
    res.status(data.success ? 200 : 400).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.deleteAgen = async (req, res) => {
  try {
    const model = new Model_cud(req);
    const data = await model.delete();
    res.status(data.success ? 200 : 400).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
