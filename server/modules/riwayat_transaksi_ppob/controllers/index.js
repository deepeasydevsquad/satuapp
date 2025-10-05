const Model_r = require("../models/model_r");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.riwayat_transaksi = async (req, res) => {
  try {
    const data = await new Model_r(req).riwayat_transaksi();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
