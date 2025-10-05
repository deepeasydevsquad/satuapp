const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/pembayaran_agen_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.post(
  "/trans_paket/get-pembayaran-agen-paket",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong."),
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
  controllers.get_all_fee
);

router.post(
  "/trans_paket/daftar_fee_by_agen",
  authenticateToken,
  [
    body("agen_id")
      .trim()
      .notEmpty()
      .withMessage("ID Agen tidak boleh kosong."),
  ],
  controllers.daftar_fee_by_agen
);

router.post(
  "/trans_paket/add_pembayaran_agen",
  authenticateToken,
  [
    body("agen_id")
      .notEmpty()
      .withMessage("ID Agen tidak boleh kosong.")
      .isInt()
      .withMessage("ID Agen harus berupa angka."),

    body("fee_agen_id")
      .isArray({ min: 1 })
      .withMessage("fee_agen_id harus berupa array dan minimal 1 item.")
      .custom((arr) => arr.every(Number.isInteger))
      .withMessage("fee_agen_id harus berisi angka semua."),

    body("nominal")
      .notEmpty()
      .withMessage("Nominal tidak boleh kosong.")
      .isNumeric()
      .withMessage("Nominal harus berupa angka.")
      .custom((val) => val > 0)
      .withMessage("Nominal harus lebih dari 0."),
  ],
  controllers.add_pembayaran_agen
);

module.exports = router;
