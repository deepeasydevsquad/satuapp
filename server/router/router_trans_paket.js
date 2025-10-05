const express = require("express");
const { body, param, query } = require("express-validator");
const controllers = require("../modules/trans_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/trans_paket");

const router = express.Router();

router.get(
  "/daftar-trans-paket/daftar-paket/list", 
  authenticateToken, 
  controllers.getPaketListTransPaket
);

router.post(
  "/daftar-trans-paket/daftar-jamaah/list",
  authenticateToken,
  [
    body("division_id").trim().notEmpty().withMessage("ID Cabang tidak boleh kosong.").custom(validation.check_id_cabang),
    body("pageNumber").trim().notEmpty().withMessage("Nomor halaman tidak boleh kosong."),
    body("perpage").trim().notEmpty().withMessage("Jumlah per halaman tidak boleh kosong.").isInt().withMessage("Jumlah per halaman harus berupa angka."),
    body("search").trim()
  ],
  controllers.getDaftarJamaahTransPaket
);

router.post(
  "/daftar-trans-paket/upload-file-pendukung",
  authenticateToken,
  validation.upload.any(), // Middleware multer untuk banyak file
  (req, res, next) => {
    console.log("mulai upload file pendukung");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    next();
  },
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Trans Paket tidak boleh kosong.")
      .custom(validation.check_id_transpaket),

    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .custom(validation.check_id_cabang),
  ],
  validation.hapusFileJikaValidasiError,
  controllers.addUploadFile
);


module.exports = router;
