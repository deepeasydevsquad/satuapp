const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_fasilitas/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_fasilitas");

const router = express.Router();

router.post(
  "/daftar-fasilitas/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarFasilitas
);

router.post(
  "/daftar-fasilitas/add",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Fasilitas tidak boleh kosong.").toUpperCase(),
  ],
  controllers.add
);

router.post(
  "/daftar-fasilitas/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Fasilitas tidak boleh kosong.").custom(validation.check_id_fasilitas),
    body("name").trim().notEmpty().withMessage("Nama Fasilitas tidak boleh kosong.").toUpperCase(),
  ],
  controllers.update
);

router.post(
  "/daftar-fasilitas/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID Fasilitas tidak boleh kosong.").isInt().withMessage("ID Fasilitas harus berupa angka.").custom(validation.check_id_fasilitas).custom(validation.check_delete_is_allow)],
  controllers.delete
);

module.exports = router;
