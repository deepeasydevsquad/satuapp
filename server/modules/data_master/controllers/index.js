const Model_r = require("../models/model_r");
const {
  handleServerError,
  handleValidationErrors,
} = require("../../../helper/handleError");

exports.getProvinsi = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftar_provinsi();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getKabupaten = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftar_kabupaten();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getKecamatan = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftar_kecamatan();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getKelurahan = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftar_kelurahan();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getMahram = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftar_mahram();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getPekerjaan = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftar_pekerjaan();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getPendiidikan = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftar_pendidikan();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getPengalamanHajiUmrah = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.daftar_haji_umrah();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getKota = async (req, res) => {

  try {
    const model = new Model_r(req);
    const data = await model.getKota();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getProviderVisa = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.getProviderVisa();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getTipePaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.getTipePaket();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getAsuransi = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.getAsuransi();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getAirlines = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.getAirlines();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getBandara = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.getBandara();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getHotel = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.getHotel();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
exports.getFasilitas = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model = new Model_r(req);
    const data = await model.getFasilitas();
    res.status(200).json(data);
  } catch (error) {
    handleServerError(res, error.message);
  }
};
