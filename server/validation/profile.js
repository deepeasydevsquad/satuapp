const { Op, Company, Member } = require("../models");
const { body } = require("express-validator");
const {} = require("../helper/companyHelper");

const validation = {};

validation.updateProfile = [
  body("email").optional().isEmail().withMessage("Format email tidak valid."),
  body("fullname").optional().isString().trim(),
  body("company_name").optional().isString().trim(),
  body("username").optional().isString().trim(),
];

validation.changePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Password saat ini wajib diisi."),
  body("newPassword")
    .isLength({ min: 5 })
    .withMessage("Password baru minimal harus 8 karakter."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Konfirmasi password tidak cocok dengan password baru.");
    }
    return true;
  }),
];

module.exports = validation;
