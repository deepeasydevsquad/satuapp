const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/riwayat_transaksi_ppob/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const router = express.Router();

router.post(
  "/ppob/riwayat_transaksi",
  authenticateToken,
  [
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
  controllers.riwayat_transaksi
);

module.exports = router;
