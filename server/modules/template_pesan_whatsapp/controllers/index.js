const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.daftar_template = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_template();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_template_by_id = async (req, res) => {
  try {
    const data = await new Model_r(req).get_template_by_id();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.add_template = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.tambah_tempale();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "tempale berhasil dibuat",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat template",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat tambah tempale:", error);
    handleServerError(res, error);
  }
};

exports.update_template = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.update_template();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "template berhasil update",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal update template",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat update tempale:", error);
    handleServerError(res, error);
  }
};

exports.delete_template = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.delete_template();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "tempale berhasil dihapus",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal menghapus template",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat hapus tempale:", error);
    handleServerError(res, error);
  }
};
