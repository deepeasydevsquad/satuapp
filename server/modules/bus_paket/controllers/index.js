const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const controllers = {};

controllers.getDaftarBusPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.bus_paket();
    res
      .status(200)
      .json({ error: false, data: feedBack.data, total: feedBack.total, status: feedBack.status });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getAvailableJamaahForForm = async (req, res) => {
  // try {
  //   // const model_r = new Model_r(req);
  //   // const forEdit = req.query.forEdit === "true";
  //   // const currentBusId = req.query.currentBusId
  //   //   ? parseInt(req.query.currentBusId)
  //   //   : null;
  //   // let jamaah;
  //   // if (forEdit) {
  //   //   jamaah = await model_r.getAllJamaahForEdit(currentBusId);
  //   // } else {
  //   //   jamaah = await model_r.getAllAvailableJamaah();
  //   // }
  //   // res.status(200).json({ error: false, data: jamaah });
  // } catch (error) {
  //   handleServerError(res, error.message);
  // }

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getAllAvailableJamaah();

    res.status(200).json({ error: false, data: feedBack.data, total: feedBack.total });
  } catch (error) {

    console.log("-------2222");
    console.log(error);
    console.log("-------2222");
    handleServerError(res, error.message);
  }
};

// Tambahkan controller baru untuk mengambil daftar kota
controllers.getAllCities = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const cities = await model_r.getAllCities();
    res.status(200).json({ error: false, data: cities });
  } catch (error) {

    console.log("############");
    console.log(error);
    console.log("############");
    handleServerError(res, error.message);
  }
};

controllers.createBusPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const feedBack = await model_cud.create_bus();
    res.status(201).json({ error: false, message: feedBack.message });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getBusById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_r = new Model_r(req);
    const busData = await model_r.get_bus_by_id(req.params.id);
    res.status(200).json({ error: false, data: busData });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.updateBusById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    const feedBack = await model_cud.update_bus(req.params.id);
    res.status(200).json({ error: false, message: feedBack.message });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.deleteBusById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    const feedBack = await model_cud.delete_bus(req.params.id);
    res.status(200).json({ error: false, message: feedBack.message });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
