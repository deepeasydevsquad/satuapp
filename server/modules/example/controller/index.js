const fs = require("fs");
// const { validationResult } = require("express-validator");
// const { error_msg } = require("../../../helpers/error");
// const {
//   info_list_syarat_permohonan,
//   info,
//   check_status_desa_kecamatan,
//   list_syarat_kegiatan,
//   get_info_survey
// } = require("../../../helpers/administrator/riwayat_pemasukan_donasi/index");
const {
  handleValidationErrors,
  handleServerError,
  messageError,
} = require("../../../helpers/handleError");

const Model_r = require("../model/model_r");
const Model_cud = require("./model/model_cud");

const controllers = {};

/**
 * Fungsi untuk menampilkan data server riwayat pemasukan donasi
 **/
controllers.server_side = async (req, res) => {
  // validation handling
  if (!(await handleValidationErrors(req, res))) return;
    
  try {
    const model_r = new Model_r(req);
    const e = await model_r.server_side();
    if(e.error) {
      res.status(400).json(messageError().DATA_NOTFOUND);
    }else{
      res.status(200).json(e.feedBack);
    }
  } catch (error) {
    handleServerError(res);
  }
};

module.exports = controllers;