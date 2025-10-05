const Model_r = require("../models/model_r");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.daftar_agen = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.daftar_detail_agen_by_paket(); // ✅ udah cukup, karena req dimasukin di constructor
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
