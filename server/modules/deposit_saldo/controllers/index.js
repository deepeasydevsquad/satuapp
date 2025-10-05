const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");
const {
  menghasilkan_invoice_deposit,
} = require("../../../helper/randomHelper");

exports.getDeposit = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftarDeposit();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.getCompany = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.dataCompany();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.addDeposit = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const invoice = await menghasilkan_invoice_deposit();
    const model_cud = new Model_cud(req);
    await model_cud.tambahDeposit(invoice);
    // get response
    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Proses Deposit Saldo Berhasil Dilakukan.",
        data: { invoice: invoice },
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Proses Deposit Saldo Gagal Dilakukan.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.infoDeposit = async (req, res) => {
  try {
    const model = new Model_r(req);
    const data = await model.infoDeposit();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

exports.get_member = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model = new Model_r(req);
    const data = await model.daftar_member();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
