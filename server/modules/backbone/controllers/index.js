const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Model_r = require("../models/model_r");

const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const controllers = {};
let refreshTokens = [];

controllers.login_process = async (req, res) => {
  if (!(await handleValidationErrors(req, res))) return;

  try {
    const body = req.body;
    const model_r = new Model_r(req);
    const data = await model_r.get_administrator_information();
    var error = false;
    var error_msg = "";

    if (Object.keys(data).length > 0) {
      const valid_password = await bcrypt.compare(body.password, data.password);
      if (!valid_password) {
        return res.status(400).json({
          error: true,
          error_msg: "Username atau Password anda tidak valid.",
        });
      }

      const userPayload = {
        id: data.id,
        fullname: data.fullname,
        username: body.username,
      };

      const accessToken = jwt.sign(
        userPayload,
        process.env.BACKBONE_SECRET_KEY,
        {
          expiresIn: "1000s",
        }
      );
      const refreshToken = jwt.sign(
        userPayload,
        process.env.BACKBONE_REFRESH_SECRET_KEY,
        { expiresIn: "7d" }
      );

      refreshTokens.push(refreshToken);

      res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
        error: false,
        error_msg: "Sukses.",
      });
    } else {
      error = true;
      error_msg =
        "Username atau Password anda tidak ditemukan di pangkalan data.";
    }

    console.log("------");
    console.log(error);
    console.log("------");

    if (error) {
      res.status(400).json({
        error: true,
        error_msg: error_msg,
      });
    }
  } catch (error) {
    handleServerError(res, error);
  }
};

controllers.backbone = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const data = await model_r.get_menu_submenu_tab();
    res.status(200).json({
      error: false,
      message: "Data Berhasil Ditemukan.",
      menu_info: data.menu_info,
      user_info: data.user_info,
    });
  } catch (error) {
    handleServerError(res, error);
  }
};

module.exports = controllers;
