const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { authenticateToken } = require("../middleware/authenticateToken");
const controllers = require("../modules/trans_transport/controllers/index");
const validationCabang  = require("../validation/param");
const validation  = require("../validation/trans_transport");

router.post(
  "/trans_transport/add_transaksi",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
    body("sumber_dana").trim().notEmpty().withMessage("Sumber Dana tidak boleh kosong.").custom(validationCabang.check_sumber_dana).custom(validation.check_saldo),
    body("kostumer").trim().isNumeric().withMessage("ID Kostumer harus berupa angka.").custom(validationCabang.check_kostumer),
    body("paket").trim().isNumeric().withMessage("ID Paket harus berupa angka.").custom(validationCabang.check_paket),
    body("details").isArray({ min: 1 }).withMessage("Minimal 1 mobil harus diinput"),
    body("details.*.mst_mobil_id").notEmpty().withMessage("Mobil wajib dipilih"),
    body("details.*.car_number").notEmpty().withMessage("Nomor mobil wajib diisi"),
    body("details.*.travelPrice").isNumeric().withMessage("Harga travel harus berupa angka"),
    body("details.*.costumerPrice").isNumeric().withMessage("Harga kostumer harus berupa angka"),
  ],
  controllers.add_transaksi_transport
);

router.post(
  "/trans_transport/delete_transaksi",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID  tidak boleh kosong.").custom(validation.check_id)
  ],
  controllers.hapus_transaksi_transport
);

router.post(
  "/trans_transport/daftar_transaksi",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
  ],
  controllers.daftar_transaksi_transport
);

router.post(
  "/trans_transport/daftar_paket",
  authenticateToken,
  [
    body("division_id")
      .trim()
      .notEmpty()
      .withMessage("ID  tidak boleh kosong."),
  ],
  controllers.daftar_paket
);

router.get(
  "/trans_transport/daftar_mobil",
  authenticateToken,
  controllers.daftar_mobil
);

router.get(
  "/trans_transport/daftar_customer",
  authenticateToken,
  controllers.daftar_customer
);

module.exports = router;
