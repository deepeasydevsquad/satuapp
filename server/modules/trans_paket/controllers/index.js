const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};

// Mendapatkan daftar paket
controllers.getPaketListTransPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getPaketListTransPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {

    console.log("__________________xxx");
    console.log(error);
    console.log("__________________xxx");
    handleServerError(error, res);
  }
};

// Mendapatkan daftar jamaah
controllers.getDaftarJamaahTransPaket = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.getDaftarJamaahTransPaket();
    res.status(200).json({ error: false, data : feedBack.data, total : feedBack.total });
  } catch (error) {
    handleServerError(error, res);
  }
}

// Tambahkan daftar file ke db
controllers.addUploadFile = async (req, res) => {
  console.log("Response: ", res)
  try {
    const model_cud = new Model_cud(req);

    console.log("model_cud:", model_cud);
    await model_cud.addUploadFile();

    if (await model_cud.response()) {
      res.status(200).json({
        message: "File berhasil diupload",
        status: "success",
      });
    } else {
      res.status(400).json({
        message: "File gagal diupload",
        status: "failed",
      });
    }
  } catch (error) {
    handleServerError(error, res);
  }
}

module.exports = controllers;

