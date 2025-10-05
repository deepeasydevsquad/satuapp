const express = require("express");
const controllers = require("../modules/peminjaman/controllers/index");
const { body } = require("express-validator");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/peminjaman");
const validationCabang  = require("../validation/param");
const router = express.Router();

/**
 * menambah peminjaman jamaah
 * http://localhost:3001/peminjaman/add-peminjaman
 */
router.post(
  "/peminjaman/add-peminjaman",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validationCabang.check_cabang_id),
    body("sumber_dana").trim().notEmpty().withMessage("Sumber dana tidak boleh kosong.").custom(validationCabang.check_sumber_dana),
    body("dp").trim(),
    body("jamaah_id").notEmpty().withMessage("Id Jamaah Tidak Boleh Kosong.").custom(validation.check_id_jamaah),
    body("mulai_bayar").notEmpty().withMessage("Tanggal Mulai Bayar Tidak Boleh Kosong.").isDate({ format: "YYYY-MM-DD" }).withMessage("Format Tanggal Mulai Bayar Tidak Sesuai"),
    body("nominal").notEmpty().withMessage("Nominal Peminjaman Tidak Boleh Kosong.").custom(validation.check_jumlah_saldo),
    body("sudah_berangkat"),
    body("tenor").notEmpty().withMessage("Tenor Tidak Boleh Kosong.").isNumeric().withMessage("Tenor hanya boleh berisi angka tanpa spasi atau simbol lainnya"),
  ],
  controllers.addPinjaman
);

/**
 * menambah peminjaman jamaah
 */
router.post(
  "/peminjaman/get-peminjaman",
  authenticateToken,
  [
    // cabang
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong."),
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
  controllers.daftarPinjaman
);

/**
 * mengambil informasi peminjaman
 */
router.post(
  "/peminjaman/get-skema",
  authenticateToken,
  [
    body("peminjaman_id").trim().notEmpty().withMessage("Id Jamaah Tidak Boleh Kosong.").custom(validation.check_id_peminjaman),
  ],
  controllers.SkemaByID
);

/**
 * mengambil informasi peminjaman
 */
router.post(
  "/peminjaman/update-skema",
  authenticateToken,
  [
    body("peminjaman_id")
      .notEmpty()
      .withMessage("id peminjaman tidak boleh kosong.")
      .custom(validation.check_id_peminjaman),
    body("updatedSkema").custom(validation.check_skema),
  ],
  controllers.updateSkema
);

/**
 * mengambil informasi peminjaman
 */
router.post(
  "/peminjaman/bayar-perbulan",
  authenticateToken,
  [
    body("peminjaman_id")
      .notEmpty()
      .withMessage("id peminjaman tidak boleh kosong."),
    body("nominal").notEmpty().withMessage("nominal tidak boleh kosong."),
  ],
  controllers.pembayaranPerbulan
);

router.post(
  "/peminjaman/download_data_peminjaman",
  authenticateToken,
  controllers.downloadDataPeminjaman
);

router.post(
  "/peminjaman/daftar_jamaah",
  [
    body("id_cabang")
      .trim()
      .notEmpty()
      .withMessage("Cabang tidak boleh kosong."),
  ],
  authenticateToken,
  controllers.get_jamaah
);

// 
router.post(
  "/peminjaman/sumber_dana",
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
  ],
  authenticateToken,
  controllers.get_sumber_dana
);

// peminjaman/hapus
router.post(
  "/peminjaman/hapus",
  authenticateToken,
  [
    body("id").notEmpty().withMessage("id peminjaman tidak boleh kosong.").custom(validation.check_id_peminjaman),
  ],
  controllers.hapus
);



module.exports = router;
