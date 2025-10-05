const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/syarat_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/syarat_paket");

const router = express.Router();

router.post(
  "/daftar-syarat-paket/get-daftar-manifest-paket/list",
  authenticateToken,
  [
    body("paketId") 
      .trim()
      .notEmpty().withMessage("ID paket tidak boleh kosong.")
      .isInt().withMessage("ID paket harus berupa angka.")
      .custom(validation.check_id_paket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .isInt().withMessage("ID Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
    body("pageNumber")
      .trim()
      .notEmpty().withMessage("Nomor halaman tidak boleh kosong.")
      .isInt().withMessage("Nomor halaman harus berupa angka."),
    body("perpage")
      .trim()
      .notEmpty().withMessage("Jumlah per halaman tidak boleh kosong.")
      .isInt().withMessage("Jumlah per halaman harus berupa angka."),
    body("search")
      .trim()
  ],
  controllers.getDaftarSyaratPaket
);

module.exports = router;
