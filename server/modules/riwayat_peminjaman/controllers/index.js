const Model_r = require("../models/model_r");
const { handleServerError, handleValidationErrors } = require("../../../helper/handleError");

exports.get_riwayat_peminjaman = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_riwayat_peminjaman();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
