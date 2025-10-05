const ModelCUD = require("../models/model_cud");
const ModelR = require("../models/model_r");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

exports.daftarKota = async (req, res) => {
  try {
    const model = new ModelR(req);
    const result = await model.getKota();

    if (!result.success) {
      throw new Error(result.error);
    }
    res.status(200).json(result);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_cabang = async (req, res) => {
  try {
    const model = new ModelR(req);
    const result = await model.getAllDivisions(); // ✅ Panggil pakai instance model

    if (!result.success) {
      throw new Error(result.error);
    }

    res.status(200).json(result);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.add = async (req, res) => {
  try {
    const model = new ModelCUD(req);
    const validationErrors = await handleValidationErrors(req); // ✅ Pastikan return array atau null

    if (validationErrors && validationErrors.length > 0) {
      return res.status(400).json({ success: false, error: validationErrors });
    }

    const result = await model.createDivision();

    if (!result.success) {
      throw new Error(
        typeof result.error === "string"
          ? result.error
          : JSON.stringify(result.error)
      );
    }

    res.status(201).json(result);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const model = new ModelCUD(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Parameter 'id' tidak ditemukan di request.",
      });
    }

    const validationErrors = await handleValidationErrors(req); // ✅ Tambahkan await
    if (validationErrors && validationErrors.length > 0) {
      return res.status(400).json({ success: false, error: validationErrors });
    }

    const result = await model.updateDivision(id);
    if (!result.success) {
      throw new Error(
        typeof result.error === "string"
          ? result.error
          : JSON.stringify(result.error)
      );
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Terjadi kesalahan server",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const model = new ModelCUD(req);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Parameter 'id' tidak ditemukan di request.",
      });
    }

    const result = await model.deleteDivision(id);
    if (!result.success) {
      throw new Error(result.error);
    }

    res.status(200).json(result);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
