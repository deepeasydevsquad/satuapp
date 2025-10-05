const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Controller = require("../modules/registrasi/controller/index");
const {
  getSubscriptionPrice,
} = require("../modules/registrasi/controller/index");
const validation = require("../validation/registrasi");

/* 
  Router untuk melakukan registrasi
*/
router.post(
  "/register",
  body("company_name")
    .notEmpty()
    .withMessage("Nama Perusahaan Tidak Boleh Kosong")
    .trim()
    .custom(validation.check_price),
  body("email")
    .notEmpty()
    .withMessage("Email Tidak Boleh Kosong")
    .trim()
    .custom(validation.check_email_perusahaan),
  body("whatsapp_company_number")
    .notEmpty()
    .withMessage("Nomor Whatsapp Perusahaan Tidak Boleh Kosong")
    .trim()
    .custom(validation.check_whatsapp_company_number),
  body("username")
    .notEmpty()
    .withMessage("Username Tidak Boleh Kosong")
    .trim()
    .custom(validation.check_username),
  body("password").notEmpty().withMessage("Password Tidak Boleh Kosong").trim(),
  body("token")
    .notEmpty()
    .withMessage("Token Tidak Boleh Kosong")
    .trim()
    .custom(validation.check_token),
  Controller.registerCompany
);

/* 
  Router untuk mengambil harga berlangganan
*/
router.get("/ambil_harga", Controller.getSubscriptionPrice);

module.exports = router;
