const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

exports.refund_tiket_detail = async (req, res) => {
  try {
    const data = await new Model_r(req).getRefundTicketDetail();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.refund_tiket = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.refund_tiket();
    // filter
    if (await model.response()) {
      res.status(200).json({
        message: "Refund berhasil dilakukan",
        invoice: model.invoice,
        error: false
      });
    } else {
      res.status(400).json({
        message: "Refund gagal dilakukan",
        error: true
      });
    }
  } catch (error) {
    console.error("Terjadi error saat Transaksi Fee:", error);
    handleServerError(res, error);
  }
};
