const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const controllers = {};

controllers.getDaftarKamarPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.kamar_paket();
    res
      .status(200)
      .json({ error: false, data: feedBack.data, status: feedBack.status, total: feedBack.total });
  } catch (error) {
    console.log("*******");
    console.log(error);
    console.log("*******");
    handleServerError(res, error.message);
  }
};

controllers.createKamarPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    const feedBack = await model_cud.create_kamar();
    res.status(201).json({ error: false, message: feedBack.message });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getHotelsForForm = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const hotels = await model_r.getAllHotels();
    res.status(200).json({ error: false, data: hotels });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getAvailableJamaahForForm = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getAllAvailableJamaah();

    res.status(200).json({ error: false, data: feedBack.data, total: feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.getAvailableJamaahForFormEdit = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getAllJamaahForEdit();

    res.status(200).json({ error: false, data: feedBack.data, total: feedBack.total });
  } catch (error) {
    handleServerError(res, error.message);
  }
}

controllers.getKamarById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_r = new Model_r(req);
    const kamarData = await model_r.get_kamar_by_id();
    res.status(200).json({ error: false, data: kamarData });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.updateKamarById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    const feedBack = await model_cud.update_kamar(req.params.id);
    res.status(200).json({ error: false, message: feedBack.message });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.deleteKamarById = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;
  try {
    const model_cud = new Model_cud(req);
    const feedBack = await model_cud.delete_kamar(req.params.id);
    res.status(200).json({ error: false, message: feedBack.message });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

controllers.downloadDaftarKamar = async (req, res) => {
  try {
    console.log("Download endpoint dipanggil");

    const model_r = new Model_r(req);
    const data = await model_r.download_daftar_kamar();

    if (!data) {
      return res.status(404).json({
        error: true,
        message: "Data tidak ditemukan",
      });
    }
    console.log("Data berhasil diambil:", {
      companyExists: !!data.company,
      roomsCount: data.rooms ? data.rooms.length : 0,
    });

    res.status(200).json({
      error: false,
      data: data,
    });
  } catch (error) {
    console.error("Error di downloadDaftarKamar:", error); 
    const errorMessage =
      error.message || "Terjadi kesalahan saat mempersiapkan data download";

    res.status(500).json({
      error: true,
      message: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports = controllers;
