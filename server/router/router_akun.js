const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/akun/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/akun");

const router = express.Router();

router.get(
  "/akun/filter_akun",
  authenticateToken,
  controllers.filter_akun
);

router.post(
  "/daftar_akun/",
  authenticateToken,
  [
    body("akun").trim().notEmpty().withMessage("Akun tidak boleh kosong.").custom(validation.check_akun),
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang),
  ],
  controllers.get_daftar_akun
);

router.post(
  "/daftar_akun/check_akun/",
  authenticateToken,
  [
    body("nomor_akun").trim().notEmpty().withMessage("Nomor Akun tidak boleh kosong.").custom(validation.check_nomor_akun),
    body("prefix").trim().notEmpty().withMessage("Prefix Nomor Akun tidak boleh kosong.").custom(validation.check_prefix),
    body("primary_id").trim().notEmpty().withMessage("Primary ID tidak boleh kosong.").custom(validation.check_primary_id),
  ],
  controllers.check_akun
);

router.post(
  "/daftar_akun/add",
  authenticateToken,
  [
    body("nama").trim().notEmpty().withMessage("Nama Akun tidak boleh kosong."),
    body("nomor").trim().notEmpty().withMessage("Nomor Akun tidak boleh kosong.").custom(validation.check_nomor_akun),
    body("primary_id").trim().notEmpty().withMessage("Primary ID tidak boleh kosong.").custom(validation.check_primary_id),
  ],
  controllers.add
);

router.post(
  "/daftar_akun/edit",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Akun tidak boleh kosong.").custom(validation.check_id_akun_secondary),
    body("nama").trim().notEmpty().withMessage("Nama Akun tidak boleh kosong."),
    body("nomor").trim().notEmpty().withMessage("Nomor Akun tidak boleh kosong.").custom(validation.check_nomor_akun),
    body("primary_id").trim().notEmpty().withMessage("Primary ID tidak boleh kosong.").custom(validation.check_primary_id),
  ],
  controllers.edit
);

router.post(
  "/daftar_akun/delete",
  authenticateToken,
  [ body("id").trim().notEmpty().withMessage("ID tidak boleh kosong.").custom(validation.check_id_akun_secondary) ],
  controllers.delete
);

router.post(
  "/daftar_akun/update_saldo",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Akun tidak boleh kosong.").custom(validation.check_id_akun_secondary_bawaan),
    body("cabang").trim().notEmpty().withMessage("ID Cabang tidak boleh kosong.").custom(validation.check_id_cabang),
    body("saldo").trim(),
  ],
  controllers.update_saldo
);

router.post(
  "/daftar_akun/tutup_buku",
  authenticateToken,
  [body("nama_periode").trim().notEmpty().withMessage("Nama Periode tidak boleh kosong.")],
  controllers.tutup_buku
);

router.get(
  "/daftar_akun/kembalikan_buku",
  authenticateToken,
  controllers.kembalikan_buku
);

module.exports = router;
