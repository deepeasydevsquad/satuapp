const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_mobil/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_mobil");

const router = express.Router();

router.post(
  "/daftar-mobil/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarMobil
);

router.post(
  "/daftar-mobil/add",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Jenis Mobil tidak boleh kosong.").toUpperCase(),
  ],
  controllers.add
);

router.post(
  "/daftar-mobil/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Jenis Mobil tidak boleh kosong.").custom(validation.check_id_mobil),
    body("name").trim().notEmpty().withMessage("Nama Jenis Mobil tidak boleh kosong.").toUpperCase(),
  ],
  controllers.update
);

router.post(
  "/daftar-mobil/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID Jenis Mobil tidak boleh kosong.").isInt().withMessage("ID Jenis Mobil harus berupa angka.").custom(validation.check_id_mobil)],
  controllers.delete
);

module.exports = router;
