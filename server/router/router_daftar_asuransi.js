const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_asuransi/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_asuransi");

const router = express.Router();

router.post(
  "/daftar-asuransi/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarAsuransi
);

router.post(
  "/daftar-asuransi/add",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Fasilitas tidak boleh kosong.").toUpperCase(),
  ],
  controllers.add
);

router.post(
  "/daftar-asuransi/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Fasilitas tidak boleh kosong.").custom(validation.check_id_asuransi),
    body("name").trim().notEmpty().withMessage("Nama Fasilitas tidak boleh kosong.").toUpperCase(),
  ],
  controllers.update
);

router.post(
  "/daftar-asuransi/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID Fasilitas tidak boleh kosong.").isInt().withMessage("ID Fasilitas harus berupa angka.").custom(validation.check_id_asuransi)],
  controllers.delete
);

module.exports = router;
