const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");
const controllers = {};

// Generate Unique Nomor Invoice
controllers.generateNomorInvoice = async (req, res) => {
  try {
    const model_cud = new Model_cud(req);
    const response = await model_cud.generateNomorInvoice();
    return res.status(200).json(response);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Generate Unique Nomor Register
controllers.generateNomorRegister = async (req, res) => {
  try {
    const model_cud = new Model_cud(req);
    const response = await model_cud.generateNomorRegister();
    return res.status(200).json(response);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getInfoPembayaranTiket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_r = new Model_r(req);
    const data = await model_r.get_info_pembayaran_tiket();
    if (Object.keys(data).length > 0) {
      res.status(200).json({ error: false, message: "Sukses", data: data });
    } else {
      res.status(400).json({ error: true, message: "Gagal" });
    }
  } catch (error) {
    console.log("*****************");
    console.log(error);
    console.log("*****************");
    handleServerError(res, error.message);
  }
};

// Menambahkan tiket baru
// controller
controllers.addTiket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    await model_cud.add();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        message: "Transaksi tiket berhasil ditambahkan",
        register_number: model_cud.register_number, // fix di sini
      });
    } else {
      res.status(400).json({
        error: false,
        message: "Transaksi tiket gagal ditambahkan",
      });
    }
  } catch (error) {
    console.log("*****************");
    console.log(error);
    console.log("*****************");
    handleServerError(res, error.message);
  }
};

// get all tickets transactions
controllers.getTicketTransactions = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_r = new Model_r(req);
    const data = await model_r.ticket_transactions();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getAirlines = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const data = await model_r.getAirlines();
    res.status(200).json({ error: false, data: data });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.add_pembayaran_ticket = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    const invoice = await model.add_pembayaran_tikects();
    // get feedBack response
    if (await model.response()) {
      res.status(200).json({
        message: "Transaksi pembayaran tiket berhasil dilakukan",
        invoice: invoice,
        error: false,
      });
    } else {
      res.status(400).json({
        message: "Transaksi pembayaran tiket gagal dilakukan",
        error: true,
      });
    }
  } catch (error) {
    handleServerError(res, error);
  }
};

controllers.get_airlines_by_id = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.get_airlines_by_id();
    // get feedBack response
    if (Object.keys(data).length > 0) {
      res.status(200).json({
        message: "Transaksi pembayaran tiket berhasil dilakukan",
        data: data,
        error: false,
      });
    } else {
      res.status(400).json({
        message: "Transaksi pembayaran tiket gagal dilakukan",
        error: true,
      });
    }
  } catch (error) {
    handleServerError(res, error);
  }
};

controllers.detail_ticket = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const data = await model_r.get_detail_tiket();
    // get feedBack response
    if (Object.keys(data).length > 0) {
      res.status(200).json({
        message: "Data detail ticket berhasil ditemukan.",
        data: data,
        error: false,
      });
    } else {
      res.status(400).json({
        message: "Data detail ticket gagal ditemukan",
        error: true,
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.daftar_customer = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_kostumer();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.daftar_paket = async (req, res) => {
  try {
    const data = await new Model_r(req).daftar_paket();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.update = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.update();
    // get feedBack response
    if (await model.response()) {
      res.status(200).json({
        message: "Proses update berhasil dilakukan",
        error: false,
      });
    } else {
      res.status(400).json({
        message: "Proses update gagal dilakukan",
        error: true,
      });
    }
  } catch (error) {
    console.log("+++++++++++++++");
    console.log(error);
    console.log("+++++++++++++++");
    handleServerError(res, error);
  }
};

controllers.delete = async (req, res) => {
  // filter error
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_cud(req);
    await model.delete();
    // get feedBack response
    if (await model.response()) {
      res
        .status(200)
        .json({ message: "Proses delete berhasil dilakukan", error: false });
    } else {
      res
        .status(400)
        .json({ message: "Proses delete gagal dilakukan", error: true });
    }
  } catch (error) {
    handleServerError(res, error);
  }
};

module.exports = controllers;
