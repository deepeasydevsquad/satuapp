const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/daftar_bandara/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_bandara");

const router = express.Router();

router.post(
  "/daftar-bandara/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarBandara
);

router.post(
  "/daftar-bandara/add",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Kota tidak boleh kosong.").toUpperCase(),
  ],
  controllers.add
);

router.post(
  "/daftar-bandara/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Kota tidak boleh kosong.").custom(validation.check_id_bandara),
    body("name").trim().notEmpty().withMessage("Nama Kota tidak boleh kosong.").toUpperCase(),
  ],
  controllers.update
);

router.post(
  "/daftar-bandara/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID Kota tidak boleh kosong.").isInt().withMessage("ID Kota harus berupa angka.").custom(validation.check_id_bandara)],
  controllers.delete
);

module.exports = router;
