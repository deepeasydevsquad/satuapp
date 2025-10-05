const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validation = require("../validation/transaksi_hotel");
const validationCabang  = require("../validation/param");
const { authenticateToken } = require("../middleware/authenticateToken");
const controllers = require("../modules/trans_hotel/controllers/index");

router.post(
  "/trans_hotel/add_transaksi",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
    body("sumber_dana").trim().notEmpty().withMessage("Sumber Dana tidak boleh kosong.").custom(validationCabang.check_sumber_dana),
    body("kostumer").trim().isNumeric().withMessage("ID Kostumer harus berupa angka.").custom(validationCabang.check_kostumer),
    body("paket").trim().isNumeric().withMessage("ID Paket harus berupa angka.").custom(validationCabang.check_paket),
    body("mst_hotel_id").trim().notEmpty().withMessage("ID Hotel tidak boleh kosong.").custom(validation.check_mst_hotel_id),
    body("check_in").trim().notEmpty().withMessage("Tanggal Check In tidak boleh kosong."),
    body("check_out").trim().notEmpty().withMessage("Tanggal Check Out tidak boleh kosong."),
    body("tipe_kamar").trim().notEmpty().withMessage("Tipe Kamar tidak boleh kosong."),
    body("jumlah_hari").trim().notEmpty().withMessage("Jumlah Hari tidak boleh kosong."),
    body("jumlah_kamar").trim().notEmpty().withMessage("Jumlah Kamar tidak boleh kosong."), 
    body("harga_travel_kamar_per_hari").trim().notEmpty().withMessage("Harga Travel Kamar Per Hari tidak boleh kosong.").custom(validation.check_saldo),
    body("harga_kostumer_kamar_per_hari").trim().notEmpty().withMessage("Harga Kostumer Kamar Per Hari tidak boleh kosong."),
  ],
  controllers.add_transaksi_hotel
);

router.post(
  "/trans_hotel/delete_transaksi",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID  tidak boleh kosong.")
  ],
  controllers.hapus_transaksi_hotel
);

router.post(
  "/trans_hotel/daftar_transaksi",
  authenticateToken,
  [
    // body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong."),
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
  controllers.daftar_transaksi_hotel
);

router.post(
  "/trans_hotel/daftar_paket",
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
  "/trans_hotel/daftar_kota",
  authenticateToken,
  controllers.daftar_kota
);
router.get(
  "/trans_hotel/daftar_hotel",
  authenticateToken,
  controllers.daftar_hotel
);
router.get(
  "/trans_hotel/daftar_customer",
  authenticateToken,
  controllers.daftar_customer
);

module.exports = router;
