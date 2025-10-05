const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_tipe_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_tipe_paket");

const router = express.Router();

router.post(
  "/daftar_tipe_paket/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.get_daftar_tipe_paket
);

router.post(
  "/daftar_tipe_paket/",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Tipe Paket tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/daftar_tipe_paket/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Tipe Paket tidak boleh kosong.").custom(validation.check_id_tipe_paket),
    body("name").trim().notEmpty().withMessage("Nama Tipe Paket tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/daftar_tipe_paket/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID Tipe Paket tidak boleh kosong.").isInt().withMessage("ID Tipe Paket harus berupa angka.").custom(validation.check_id_tipe_paket)],
  controllers.delete
);

module.exports = router;
