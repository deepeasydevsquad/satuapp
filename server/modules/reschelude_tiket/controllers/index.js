const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

exports.detail_reschedule = async (req, res) => {
  try {
    const data = await new Model_r(req).get_tiket();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.reschelude = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.reschedule_tiket();

    if (await model.response()) {
      res.status(200).json({
        message: model.message || "Transaksi berhasil dibuat",
        invoice: model.invoice,
        status: "success",
      });
    } else {
      res.status(400).json({
        message: model.message || "Gagal membuat Transaksi",
        status: "failed",
      });
    }
  } catch (error) {
    console.error("Terjadi error saat Transaksi Fee:", error);
    console.error(error.stack);
    handleServerError(res, error);
  }
};
