const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/transaksi_visa/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

// Import validasi custom
const validation = require("../validation/transaksi_visa.js");
const visaValidasi = require("../validation/visa");
const validationCabang  = require("../validation/param");

const router = express.Router();

// RUTE UNTUK MENGAMBIL LIST DATA
router.post(
  "/daftar-transaksi-visa/get-transaksi-visa/list",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
    body("filter").trim(),
  ],
  controllers.getDaftarTransaksiVisa
);

router.post(
  "/transaksi-visa/get-sumber-dana-paket",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
  ],
  controllers.getSumberDanaPaket
);

router.post(
  "/daftar-transaksi-visa/add-new",
  authenticateToken,
  visaValidasi,
  controllers.add_transaksi_visa
);

router.post(
  "/transaksi-visa/add-visa",
  authenticateToken,
  [ 
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
    body("sumber_dana").trim().notEmpty().withMessage("Sumber dana tidak boleh kosong.").custom(validationCabang.check_sumber_dana),
    body("kostumer").trim().isNumeric().withMessage("ID Kostumer harus berupa angka.").custom(validation.check_kostumer),
    body("paket").trim().isNumeric().withMessage("ID Paket harus berupa angka."),
    body("jenis_visa").trim().notEmpty().withMessage("Jenis Visa tidak boleh kosong.").isNumeric().withMessage("ID Jenis Visa harus berupa angka.").custom(validation.check_jenis_visa),
    body("pax").trim().notEmpty().withMessage("Pax tidak boleh kosong.").isNumeric().withMessage("Pax harus berupa angka."),
    body("harga_travel").trim().notEmpty().withMessage("Harga Travel tidak boleh kosong.").isNumeric().withMessage("Harga travel harus berupa angka.").custom(validation.check_saldo),
    body("harga_costumer").trim().notEmpty().withMessage("Harga Kostumer tidak boleh kosong.").isNumeric().withMessage("Harga kostumer harus berupa angka."),
  ],
  controllers.addVisa
);

router.delete(
  "/daftar-transaksi-visa/delete/:id",
  authenticateToken,
  [
    param("id", "ID tidak valid").isInt({ min: 1 }).withMessage("ID harus berupa angka positif").custom(validation.check_visa_transaction_exists),
  ],
  controllers.deleteTransaksiVisa
);

router.get(
  "/transaksi-visa/get-all-cities",
  authenticateToken,
  controllers.getAllCities
);

router.get(
  "/transaksi-visa/get-all-visa-types",
  authenticateToken,
  controllers.getAllVisaTypes
);

router.get(
  "/transaksi-visa/daftar-kostumer",
  authenticateToken,
  controllers.daftar_customer
);

router.post(
  "/transaksi-visa/daftar-paket",
  authenticateToken,
  [ body("division_id").trim().notEmpty().withMessage("ID Divisi tidak boleh kosong.") ],
  controllers.daftar_paket
);

router.get(
  "/transaksi-visa/daftar-jenis-visa",
  authenticateToken,
  controllers.daftar_jenis_visa
);

module.exports = router;
