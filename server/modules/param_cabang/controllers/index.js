const Model_r = require("../models/model_r");
const{ getCompanyIdByCode, tipe, username, getCabang } = require("../../../helper/companyHelper");
// const Model_cud = require("../models/model_cud");
// const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");

const controllers = {};


// controllers.checkCabang = async ( req , res ) => {
//    try {
//       const model_r = new Model_r(req);
//       const feedBack = await model_r.checkCabang();
//       res.status(200).json({ error: false, data : feedBack });
//    } catch (error) {
//       // console.log("----------------SSS");
//       // console.log(error);
//       // console.log("----------------SSS");
//       res.status(400).json({
//         error: true,
//         error_msg: 'Info tidak ditemukan.',
//       });
//    }
// }

controllers.paramCabang = async ( req, res ) => {
   try {
      const model_r = new Model_r(req);
      const feedBack = await model_r.paramCabang();
      res.status(200).json({ error: false, data : feedBack });
   } catch (error) {
      console.log("----------------SSS");
      console.log(error);
      console.log("----------------SSS");
      res.status(400).json({
        error: true,
        error_msg: 'Info tidak ditemukan.',
      });
   }
}

controllers.paramAkun = async ( req, res ) => {
  try {
      const model_r = new Model_r(req);
      const feedBack = await model_r.paramAkun();
      res.status(200).json({ error: false, data : feedBack });
   } catch (error) {
      res.status(400).json({
        error: true,
        error_msg: 'Info tidak ditemukan.',
      });
   }
}

controllers.paramPeriode = async ( req, res ) => {
  try {
      const model_r = new Model_r(req);
      const feedBack = await model_r.paramPeriode();
      res.status(200).json({ error: false, data : feedBack });
   } catch (error) {
      res.status(400).json({
        error: true,
        error_msg: 'Info tidak ditemukan.',
      });
   }
}

controllers.GetUserType = async ( req, res ) => {
  try {
      const types = await tipe(req);
      res.status(200).json({ error: false, data : types });
   } catch (error) {
      res.status(400).json({
        error: true,
        error_msg: 'Type tidak ditemukan.',
      });
   }
}



module.exports = controllers;
