const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/buku_besar/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/buku_besar");

const router = express.Router();

router.post("/daftar_buku_besar/list",
  authenticateToken,
  [
    body("pageNumber").trim().notEmpty().withMessage("Page Number tidak boleh kosong."),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
    body("akun").trim().notEmpty().withMessage("Akun tidak boleh kosong.").custom(validation.check_akun_id),
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang_id),
    body("periode").trim().notEmpty().withMessage("Periode tidak boleh kosong.").custom(validation.check_periode_id),
  ],
  controllers.list
);

router.post(
  "/daftar_buku_besar/download_data_buku_besar",
  authenticateToken,
  [
    body("akun").trim().notEmpty().withMessage("Akun tidak boleh kosong.").custom(validation.check_akun_id),
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang_id),
    body("periode").trim().notEmpty().withMessage("Periode tidak boleh kosong.").custom(validation.check_periode_id),
  ],
  controllers.downloadDataBukuBesar
);

module.exports = router;
