const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/daftar_kota/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_kota");

const router = express.Router();

router.post(
  "/daftar-kota/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.get_daftar_kota
);

router.post(
  "/daftar-kota/add",
  authenticateToken,
  [
    body("kode").trim().notEmpty().withMessage("Kode Kota tidak boleh kosong.").toUpperCase().custom(validation.check_add_kode_kota),
    body("name").trim().notEmpty().withMessage("Nama Kota tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/daftar-kota/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Kota tidak boleh kosong.").custom(validation.check_id_kota),
    body("kode").trim().notEmpty().withMessage("Kode Kota tidak boleh kosong.").toUpperCase().custom(validation.check_edit_kode_kota),
    body("name").trim().notEmpty().withMessage("Nama Kota tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/daftar-kota/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID Kota tidak boleh kosong.").isInt().withMessage("ID Kota harus berupa angka.").custom(validation.check_id_kota)],
  controllers.delete
);

module.exports = router;
