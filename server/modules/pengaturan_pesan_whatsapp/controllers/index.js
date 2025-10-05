const Model_cud = require("../models/model_cud");
const Model_r = require("../models/model_r");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.update_pengaturan_whatsapp = async (req, res) => {
  // filter error
  const isValid = await handleValidationErrors(req, res);

  if (!isValid) return;

  try {
    const model = new Model_cud(req);
    await model.update_setingan_whatsapp();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Pengaturan berhasil diupdate",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal update pengaturan",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat membuat pengaturan:", error);
    handleServerError(res, error);
  }
};

exports.check_koneksi = async (req, res) => {
  try {
    const model = new Model_r(req);
    const result = await model.cek_koneksi_device(req, res);
    res.json(result);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_key = async (req, res) => {
  try {
    const model = new Model_r(req);
    const result = await model.get_key(req, res);
    res.json(result);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
