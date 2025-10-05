const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.add_pesan = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req, res);
    await model.add_pesan();

    const success = await model.response();

    if (success) {
      try {
        await model.hit_kewapisender({
          type: req.body.type,
          pesan: req.body.pesan,
          whatsapp_template_id: req.body.whatsapp_template_id,
        });
      } catch (err) {
        console.warn("Gagal kirim pesan WA:", err.message);
      }

      res.status(200).json({
        message: model.message || "Pesan berhasil dibuat dan WA dikirim",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat pesan",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat add_pesan:", error);
    handleServerError(res, error);
  }
};

exports.get_data = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.get_initial_data();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_message = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.get_message_by_template_id();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_nomor_company = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.get_nomor_company();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.daftar_pesan = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.daftar_pesan();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.delete_pesan = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.delete_pesan();

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
