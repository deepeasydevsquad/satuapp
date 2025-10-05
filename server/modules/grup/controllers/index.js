const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

exports.getMenu = async (req, res) => {
  try {
    const menu = await new Model_r(req).getMenu();
    res.status(200).json(menu);
  } catch (error) {
    handleServerError(res, error.message); // ✅ Perbaikan di sini
  }
};

exports.getGrup = async (req, res) => {
  try {
    const grup = await new Model_r(req).list();
    res.status(200).json({error: false, 
      error_message: '',
      data : grup.data,
      total: grup.total
    });
  } catch (error) {
    handleServerError(res, error.message); // ✅ Perbaikan di sini
  }
};

exports.addGrup = async (req, res) => {
  try {
    const grup = await new Model_cud(req).add();
    res.status(200).json(grup);
  } catch (error) {
    handleServerError(res, error.message); // ✅ Perbaikan di sini
  }
};

exports.updateGrup = async (req, res) => {
  try {
    const grup = await new Model_cud(req).update();
    res.status(200).json(grup);
  } catch (error) {
    handleServerError(res, error.message); // ✅ Perbaikan di sini
  }
};

exports.deleteGrup = async (req, res) => {
  try {
    const grup = await new Model_cud(req).delete();
    res.status(200).json(grup);
  } catch (error) {
    handleServerError(res, error.message); // ✅ Perbaikan di sini
  }
};
