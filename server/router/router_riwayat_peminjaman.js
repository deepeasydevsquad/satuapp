const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/riwayat_peminjaman/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_mobil");

const router = express.Router();

router.post(
  "/riwayat_peminjaman",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong."),
    body("pageNumber").trim(),
    body("perpage")
      .trim()
      .notEmpty()
      .withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.get_riwayat_peminjaman
);

module.exports = router;
