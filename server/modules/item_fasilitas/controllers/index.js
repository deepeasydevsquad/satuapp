const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

// list agen
exports.list = async (req, res) => {
  console.log("controller item");
  try {
    const model = new Model_r(req);
    const data = await model.daftar_item();
    res.status(200).json(data);
  } catch (error) {
    console.log("_____DDDDD_______");
    console.log(error);
    console.log("_____DDDDD_______");
    handleServerError(res, error.message);
  }
};

exports.hapus_stok = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_cud = new Model_cud(req);
    await model_cud.hapus_stok();

    if (await model_cud.response()) {
      res.status(200).json({
        error: false,
        error_msg: "Fasilitas berhasil diupdate.",
      });
    } else {
      res.status(400).json({
        error: true,
        error_msg: "Fasilitas gagal diupdate.",
      });
    }
  } catch (error) {
    handleServerError(res, error.message);
  }
};
