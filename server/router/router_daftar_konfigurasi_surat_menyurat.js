const express = require("express");
const controllers = require("../modules/daftar_surat_menyurat/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const router = express.Router();
const validasiKonfigurasiSurat = require("../validation/konfigurasi_surat");
const SuratValidator = require("../validation/add_surat");
const { body } = require("express-validator");

router.post(
  "/daftar_surat_menyurat/delete_surat",
  [body("id").trim().notEmpty().withMessage("ID Surat tidak boleh kosong.")],
  authenticateToken,
  controllers.deleteSurat
);

router.post(
  "/daftar_surat_menyurat/add_surat",
  authenticateToken,
  SuratValidator(),
  controllers.addSurat
);

router.post(
  "/daftar_surat_menyurat/add_konfigurasi_surat",
  authenticateToken,
  validasiKonfigurasiSurat,
  controllers.addKonfigurasi
);

router.get(
  "/daftar_surat_menyurat/get_jamaah_surat",
  authenticateToken,
  controllers.get_daftar_jamaah
);

router.post(
  "/daftar_surat_menyurat/get_konfigurasi_surat",
  authenticateToken,
  controllers.get_konfigurasi
);

router.post(
  "/daftar_surat_menyurat/get_riwayat_surat",
  authenticateToken,
  [body("pageNumber").trim(), body("perpage").trim(), body("search").trim()],
  controllers.get_riwayat_surat
);

router.post(
  "/cetak_surat/:jenis_surat",
  authenticateToken,
  validasiKonfigurasiSurat,
  controllers.cetak_surat
);

module.exports = router;
