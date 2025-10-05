const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/kostumer/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/kostumer");

const router = express.Router();

router.post(
  "/kostumer/list",
  authenticateToken,  
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarKostumer
);

router.post(
  "/kostumer/add",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Kota tidak boleh kosong."),
    body("mobile_number").trim().notEmpty().withMessage("Nomor Telepon tidak boleh kosong."),
    body("address").trim().notEmpty().withMessage("Alamat tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/kostumer/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Kota tidak boleh kosong.").custom(validation.check_id_kostumer),
    body("name").trim().notEmpty().withMessage("Nama Kota tidak boleh kosong."),
    body("mobile_number").trim().notEmpty().withMessage("Nomor Telepon tidak boleh kosong."),
    body("address").trim().notEmpty().withMessage("Alamat tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/kostumer/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID Kota tidak boleh kosong.").isInt().withMessage("ID Kota harus berupa angka.").custom(validation.check_id_kostumer)],
  controllers.delete
);

module.exports = router;
