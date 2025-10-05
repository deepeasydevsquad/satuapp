const Model_r = require("../models/model_r");
const { handleValidationErrors, handleServerError } = require("../../../helper/handleError");
const ExcelJS = require("exceljs");
const{ convertToRP } = require("../../../helper/currencyHelper");

const controllers = {};

controllers.list = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const model_r = new Model_r(req);
    const feedBack = await model_r.list();

    res.status(200).json({ error: false, data : feedBack.list });
  } catch (error) {
    console.log("------------");
    console.log(error);
    console.log("------------");
    handleServerError(res, error.message);
  }
};

module.exports = controllers;
