const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/transaksi_passport/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const validation = require("../validation/transaksi_passport.js");
const validationCabang  = require("../validation/param");

const router = express.Router();

// RUTE UNTUK MENGAMBIL LIST DATA
router.post(
  "/daftar-transaksi-passport/get-transaksi-passport/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage")
      .trim()
      .notEmpty()
      .withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
    body("filter").trim(),
  ],
  controllers.getDaftarTransaksiPassport
);

router.post(
  "/daftar-transaksi-passport/add-new",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validationCabang.check_cabang_id),
    body("sumber_dana").trim().notEmpty().withMessage("Sumber dana tidak boleh kosong.").custom(validationCabang.check_sumber_dana),
    body("kostumer").trim().custom(validationCabang.check_kostumer),
    body("paket").trim().custom(validationCabang.check_paket).custom(validation.check_jumlah_saldo),
    body("passport_details","Detail passport harus berupa array dan tidak boleh kosong.").isArray({ min: 1 }).withMessage("Setidaknya satu detail passport harus disediakan."),
    body("passport_details.*.name", "Nama pelanggan wajib diisi.").notEmpty().trim(),
    body("passport_details.*.identity_number", "Nomor Identitas wajib diisi.").notEmpty().trim(),
    body("passport_details.*.kk_number", "Nomor KK wajib diisi.").notEmpty().trim(),
    body("passport_details.*.birth_place", "Tempat Lahir wajib diisi.").notEmpty().trim(),
    body("passport_details.*.birth_date", "Tanggal Lahir tidak valid.").isISO8601().toDate().custom(validation.check_birth_date),
    body("passport_details.*.address", "Alamat wajib diisi.").notEmpty().trim(),
    body("passport_details.*.city", "Kota wajib dipilih.").notEmpty().isInt({ min: 1 }).withMessage("ID Kota harus berupa angka").custom(validation.check_city_id),
    body("passport_details.*.price", "Harga harus berupa angka dan lebih dari 0.").isNumeric().custom(validation.check_price),
    body("passport_details.*.priceCostumer", "Harga harus berupa angka dan lebih dari 0.").isNumeric().custom(validation.check_price),
  ],
  controllers.addNewTransaksiPassport
);

router.get(
  "/transaksi-passport/get-all-cities",
  authenticateToken,
  controllers.getAllCities
);

router.post(
  "/transaksi-passport/daftar-paket",
  authenticateToken,
  [body("division_id").notEmpty().withMessage("ID Divisi tidak boleh kosong.")],
  controllers.daftar_paket
);

router.get(
  "/transaksi-passport/daftar-kostumer",
  authenticateToken,
  controllers.daftar_kostumer
);

router.delete(
  "/daftar-transaksi-passport/delete/:id",
  authenticateToken,
  [
    param("id", "ID tidak valid")
      .isInt({ min: 1 })
      .withMessage("ID harus berupa angka positif")
      .custom(validation.check_passport_transaction_exists),
  ],
  controllers.deleteTransaksiPassport
);

module.exports = router;
