const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_paket");

const router = express.Router();

router.post(
  "/daftar-paket/list",
  authenticateToken,
  [
    body("division_id").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_id_cabang),
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
    body("filter").trim(),
  ],
  controllers.getDaftarPaket
);

router.post(
  "/daftar-paket/paketlist",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Paket tidak boleh kosong.").custom(validation.check_id_paket),
    body("division_id").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_id_cabang)
  ],
  controllers.getDaftarPaketById
);

router.post(
  '/daftar-paket/add',
  authenticateToken,
  (req, res, next) => {
    console.log('\n🕵️‍♂️ Incoming request headers:');
    console.log('  Content-Type:', req.headers['content-type']);
    next();
  },
  // 3️⃣ Sekarang restore ke single('photo') untuk behavior normal
  validation.upload.single('photo'),
  (req, res, next) => {
    console.log('✅ After .single("photo") → req.file:', req.file);
    console.log('✅ After .single → req.body.photo:', req.body.photo);
    next();
  },
  [
    body("division_id").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_id_cabang),
    body("jenis_kegiatan").trim().notEmpty().withMessage("Jenis Kegiatan tidak boleh kosong."),
    body("name").trim().notEmpty().withMessage("Nama Paket tidak boleh kosong."),
    body("description").trim().notEmpty().withMessage("Deskripsi tidak boleh kosong."),
    body("departure_date").trim().notEmpty().withMessage("Tanggal Keberangkatan tidak boleh kosong."),
    body("return_date").trim().notEmpty().withMessage("Tanggal Kepulangan tidak boleh kosong."),
    body("departure_from").trim().notEmpty().withMessage("Keberangkatan Dari tidak boleh kosong."),
    body("mahram_fee").trim().notEmpty().withMessage("Biaya Mahram tidak boleh kosong."),
    body("quota_jamaah").trim().notEmpty().withMessage("Kuota Jamaah tidak boleh kosong."),
    body("city_visited").trim().notEmpty().withMessage("Kota yang Dikunjungi tidak boleh kosong."),
    body("airlines").trim().notEmpty().withMessage("Maskapai tidak boleh kosong."),
    body("hotel").trim().notEmpty().withMessage("Hotel tidak boleh kosong."),
    body("facilities").trim().notEmpty().withMessage("Fasilitas tidak boleh kosong."),
    body("show_homepage").trim(),
    body("airport_destination").trim().notEmpty().withMessage("Bandara Tujuan tidak boleh kosong."),
    body("airport_departure").trim().notEmpty().withMessage("Bandara Keberangkatan tidak boleh kosong."),
    body("departure_time").trim().notEmpty().withMessage("Waktu Keberangkatan tidak boleh kosong."),
    body("arrival_time").trim().notEmpty().withMessage("Waktu Kedatangan tidak boleh kosong."),
    body("provider_visa_id").trim().notEmpty().withMessage("Provider Visa tidak boleh kosong."),
    body("asuransi_id").trim().notEmpty().withMessage("Asuransi tidak boleh kosong."),
    body("no_polis").trim(),
    body("tgl_input_polis").trim(),
    body("tgl_awal_polis").trim(),
    body("tgl_akhir_polis").trim(),
    body("paket_types").trim().notEmpty().withMessage("Tipe Paket tidak boleh kosong."),
    body("paket_prices").trim().notEmpty().withMessage("Harga Paket tidak boleh kosong.")
  ],
  validation.removeUploadedFileOnValidationError,
  controllers.add
);

router.post(
  '/daftar-paket/update',
  authenticateToken,
  (req, res, next) => {
    console.log('\n🕵️‍♂️ Incoming request headers:');
    console.log('  Content-Type:', req.headers['content-type']);
    next();
  },
  // 3️⃣ Sekarang restore ke single('photo') untuk behavior normal
  validation.upload.single('photo'),
  (req, res, next) => {
    console.log('✅ After .single("photo") → req.file:', req.file);
    console.log('✅ After .single → req.body.photo:', req.body.photo);
    next();
  },
  [
    body("id").trim().notEmpty().withMessage("ID Paket tidak boleh kosong.").custom(validation.check_id_paket),
    body("division_id").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_id_cabang),
    body("jenis_kegiatan").trim().notEmpty().withMessage("Jenis Kegiatan tidak boleh kosong."),
    body("name").trim().notEmpty().withMessage("Nama Paket tidak boleh kosong."),
    body("description").trim().notEmpty().withMessage("Deskripsi tidak boleh kosong."),
    body("departure_date").trim().notEmpty().withMessage("Tanggal Keberangkatan tidak boleh kosong."),
    body("return_date").trim().notEmpty().withMessage("Tanggal Kepulangan tidak boleh kosong."),
    body("departure_from").trim().notEmpty().withMessage("Keberangkatan Dari tidak boleh kosong."),
    body("duration_trip").trim().notEmpty().withMessage("Durasi Perjalanan tidak boleh kosong."),
    body("mahram_fee").trim().notEmpty().withMessage("Biaya Mahram tidak boleh kosong."),
    body("quota_jamaah").trim().notEmpty().withMessage("Kuota Jamaah tidak boleh kosong."),
    body("city_visited").trim().notEmpty().withMessage("Kota yang Dikunjungi tidak boleh kosong."),
    body("airlines").trim().notEmpty().withMessage("Maskapai tidak boleh kosong."),
    body("hotel").trim().notEmpty().withMessage("Hotel tidak boleh kosong."),
    body("facilities").trim().notEmpty().withMessage("Fasilitas tidak boleh kosong."),
    body("show_homepage").trim(),
    body("airport_destination").trim().notEmpty().withMessage("Bandara Tujuan tidak boleh kosong."),
    body("airport_departure").trim().notEmpty().withMessage("Bandara Keberangkatan tidak boleh kosong."),
    body("departure_time").trim().notEmpty().withMessage("Waktu Keberangkatan tidak boleh kosong."),
    body("arrival_time").trim().notEmpty().withMessage("Waktu Kedatangan tidak boleh kosong."),
    body("provider_visa_id").trim().notEmpty().withMessage("Provider Visa tidak boleh kosong."),
    body("asuransi_id").trim().notEmpty().withMessage("Asuransi tidak boleh kosong."),
    body("no_polis").trim(),
    body("tgl_input_polis").trim(),
    body("tgl_awal_polis").trim(),
    body("tgl_akhir_polis").trim(),
    body("paket_types").trim().notEmpty().withMessage("Tipe Paket tidak boleh kosong."),
    body("paket_prices").trim().notEmpty().withMessage("Harga Paket tidak boleh kosong.")
  ],
  validation.removeUploadedFileOnValidationError,
  controllers.update
);

router.post(
  "/daftar-paket/delete",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("ID Paket tidak boleh kosong.")
      .isInt()
      .withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),

    body("division_id")
      .trim()
      .notEmpty()
      .withMessage("Cabang tidak boleh kosong.")
      .custom(validation.check_id_cabang),
  ],
  controllers.delete
);


module.exports = router;
