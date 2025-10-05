const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/refund_paket_la/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/refund_paket_la");

const router = express.Router();

router.post(
  "/refund_paket_la/list",
  authenticateToken,
  [
    body("paketlaId")
      .trim()
      .notEmpty()
      .withMessage("ID Paket LA tidak boleh kosong.")
      .custom(validation.check_id_paket_la),
  ],
  controllers.get_refund_paket_la
);

router.post(
  "/refund_paket_la/",
  authenticateToken,
  [
    body("paketlaId").trim().notEmpty().withMessage("ID Paket LA tidak boleh kosong.").custom(validation.check_id_paket_la),
    body("refund").isFloat({ min: 0 }).withMessage("Jumlah Pembayaran harus berupa angka."),
    body("deposit_name").isString().trim().notEmpty().withMessage("Nama Penerima Deposit tidak boleh kosong."),
    body("deposit_hp_number").isString().trim().notEmpty().withMessage("Nomor HP Penerima Deposit tidak boleh kosong."),
    body("deposit_address").isString().trim().notEmpty().withMessage("Alamat Penerima Deposit tidak boleh kosong."),
  ],
  controllers.add
);

module.exports = router;
