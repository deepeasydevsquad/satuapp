// 

const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/kas_keluar_masuk/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const validation = require("../validation/kas_keluar_masuk.js");
const params = require("../validation/param.js");
// check_cabang_id

const router = express.Router();

// Rute untuk mengambil data akun
router.get(
  "/kas-keluar-masuk/get-akun",
  authenticateToken,
  controllers.getAkun
);

// Rute untuk menambahkan data kas keluar masuk baru kedalam database
router.post(
  "/kas-keluar-masuk/add",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(params.check_cabang_id),
    body("tanggal_transaksi").trim().notEmpty().withMessage("Tanggal Transaksi tidak boleh kosong."),
    body("diterima_dibayar").trim().notEmpty().withMessage("Diterima Dari atau Dibayar Kepada tidak boleh kosong."),
    body("ref").trim().notEmpty().withMessage("Referensi tidak boleh kosong."),
    body("keterangan").trim().notEmpty().withMessage("Keterangan tidak boleh kosong."),
    body("kaskeluarmasuk.*.akun_debet").trim().notEmpty().withMessage("Akun Debet tidak boleh kosong.").custom(validation.check_akun),
    body("kaskeluarmasuk.*.akun_kredit").trim().notEmpty().withMessage("Akun Kredit tidak boleh kosong.").custom(validation.check_akun),
    body("kaskeluarmasuk.*.saldo").trim().notEmpty().withMessage("Saldo tidak boleh kosong.").custom(validation.check_saldo),    
  ],
  controllers.addKasKeluarMasuk
);

// Route untuk list
router.post(
  "/kas-keluar-masuk/list",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong."),
    body("pageNumber").trim().notEmpty().withMessage("Page Number tidak boleh kosong."),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.list
);


router.post(
  "/kas-keluar-masuk/delete",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Kas Keluar Masuk tidak boleh kosong.").custom(validation.check_id),
  ],
  controllers.delete
);

  // body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(params.check_cabang_id),
  // body("tanggal_transaksi").trim().notEmpty().withMessage("Tanggal Transaksi tidak boleh kosong."),
  // body("diterima_dibayar").trim().notEmpty().withMessage("Diterima Dari atau Dibayar Kepada tidak boleh kosong."),
  // body("ref").trim().notEmpty().withMessage("Referensi tidak boleh kosong."),
  // body("keterangan").trim().notEmpty().withMessage("Keterangan tidak boleh kosong."),
  // body("kaskeluarmasuk.*.akun_debet").trim().notEmpty().withMessage("Akun Debet tidak boleh kosong.").custom(validation.check_akun),
  // body("kaskeluarmasuk.*.akun_kredit").trim().notEmpty().withMessage("Akun Kredit tidak boleh kosong.").custom(validation.check_akun),
  // body("kaskeluarmasuk.*.saldo").trim().notEmpty().withMessage("Saldo tidak boleh kosong.").custom(validation.check_saldo), 

// http://localhost:3001/kas-keluar-masuk/get-akun


// // Rute untuk mengambil data jamaah yang tersedia (untuk form dropdown)
// router.get(
//   "/daftar-kamar-paket/get-available-jamaah",
//   authenticateToken,
//   controllers.getAvailableJamaahForForm
// );

// // PERBAIKAN: Route download harus sebelum route dengan parameter :id
// router.get(
//   "/daftar-kamar-paket/download",
//   authenticateToken,
//   controllers.downloadDaftarKamar
// );

// router.get(
//   "/daftar-kamar-paket/:id",
//   authenticateToken,
//   [param("id").isInt().withMessage("ID Kamar tidak valid.")],
//   controllers.getKamarById
// );

// // RUTE BARU: Memperbarui data satu kamar berdasarkan ID
// router.put(
//   "/daftar-kamar-paket/:id",
//   authenticateToken,
//   [
//     param("id").isInt().withMessage("ID Kamar tidak valid."),
//     ...validation.createKamar,
//   ],
//   controllers.updateKamarById
// );

// router.delete(
//   "/daftar-kamar-paket/:id",
//   authenticateToken,
//   [param("id").isInt().withMessage("ID Kamar tidak valid.")],
//   controllers.deleteKamarById
// );

module.exports = router;
