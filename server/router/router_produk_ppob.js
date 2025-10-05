const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/produk_ppob/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.post(
  "/ppob/daftar_produk",
  authenticateToken,
  [
    body("tipe").trim().notEmpty().withMessage("Tipe  tidak boleh kosong."),
    body("pageNumber")
      .trim()
      .notEmpty()
      .withMessage("Page Number tidak boleh kosong."),
    body("perpage")
      .trim()
      .notEmpty()
      .withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.daftar_produk
);

router.post(
  "/ppob/add",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("Ppob tidak boleh kosong."),
    body("tipe").trim().notEmpty().withMessage("Tipe tidak boleh kosong."),
    body("markup").trim().notEmpty().withMessage("markup tidak boleh kosong."),
  ],
  controllers.add_markup
);

router.post(
  "/ppob/delete",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("Ppob tidak boleh kosong."),
    body("tipe").trim().notEmpty().withMessage("Tipe tidak boleh kosong."),
  ],
  controllers.hapus_markup
);

module.exports = router;
