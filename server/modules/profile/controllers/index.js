"use strict";
const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const controllers = {};

controllers.getProfile = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const data = await model_r.getProfile();
    res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error("--- ERROR TERTANGKAP DI CONTROLLER PROFIL ---");
    console.error(error);
    handleServerError(res, error);
  }
};

controllers.updateProfile = async (req, res) => {
  try {
    const isValid = await handleValidationErrors(req, res);
    if (!isValid) {
      return;
    }

    const modelUpdate = new Model_cud(req);
    const result = await modelUpdate.updateProfile(req.body);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    console.error("--- ERROR TERTANGKAP DI CONTROLLER UPDATE PROFIL ---");
    console.error(error);

    if (!res.headersSent) {
      handleServerError(res, error);
    }
  }
};

controllers.changePassword = async (req, res) => {
  try {
    console.log("--- DEBUG CHANGE PASSWORD CONTROLLER ---");
    console.log("Request body:", req.body);
    console.log("User info:", req.user);
    const isValid = await handleValidationErrors(req, res);
    if (!isValid) {
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password dan new password harus diisi.",
      });
    }

    const modelUpdate = new Model_cud(req);

    const result = await modelUpdate.changePassword({
      currentPassword,
      newPassword,
    });

    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    console.error("--- ERROR DI CONTROLLER CHANGE PASSWORD ---");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    if (!res.headersSent) {
      const statusCode = error.statusCode || 500;
      const message = error.message || "Internal Server Error";

      return res.status(statusCode).json({
        status: "error",
        message: message,
      });
    }
  }
};

module.exports = controllers;
