const express = require("express");
const { body, param, query } = require("express-validator");
const controllers = require("../modules/daftar_jamaah_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_jamaah_paket");

const router = express.Router();

router.post(
  "/daftar-jamaah-paket/get-petugas-jamaah-paket",
  authenticateToken,
  [
    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .isInt().withMessage("ID Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controllers.getPetugasJamaahPaket
)

router.get(
  "/daftar-jamaah-paket/cetak-data-jamaah/:id/cetak",
  authenticateToken,
  [
    param("id")
      .trim()
      .notEmpty().withMessage("ID transaksi paket tidak boleh kosong.")
      .isInt().withMessage("ID transaksi paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    query("petugasId")
      .trim()
      .notEmpty().withMessage("ID Petugas tidak boleh kosong."),
    ],
  controllers.getCetakDataJamaahPaket
);

router.get(
  "/daftar-jamaah-paket/absensi-jamaah-paket/:paketId/cetak",
  authenticateToken,
  [
    param("paketId")
      .trim()
      .notEmpty().withMessage("ID transaksi paket tidak boleh kosong.")
      .isInt().withMessage("ID transaksi paket harus berupa angka.")
      .custom(validation.check_id_paket),
    query("petugasId")
      .trim()
      .notEmpty().withMessage("ID Petugas tidak boleh kosong."),
    ],
  controllers.getCetakAbsensiJamaahPaket
);

router.post(
  "/daftar-jamaah-paket/get-daftar-jamaah-paket/list",
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
    body("pageNumber").trim(),
    body("perpage")
      .trim()
      .notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search")
      .trim()
  ],
  controllers.getDaftarJamaahPaket
);

router.post(
  "/daftar-jamaah-paket/get-mst-fasilitas/list",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID transaksi paket tidak boleh kosong.")
      .isInt().withMessage("ID transaksi paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
  ],
  controllers.getMstFasilitas
);

router.post(
  "/daftar-jamaah-paket/get-handover-fasilitas",
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID transaksi paket tidak boleh kosong.")
      .isInt().withMessage("ID transaksi paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
  ],
  authenticateToken,
  controllers.getHandoverFasilitasById
);

router.post(
  "/daftar-jamaah-paket/add-handover-fasilitas",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID transaksi paket tidak boleh kosong.")
      .isInt().withMessage("ID transaksi paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    body("penerima")
      .trim()
      .notEmpty().withMessage("Nama Penerima tidak boleh kosong.")  
      .toUpperCase(),
    body("nomor_identitas_penerima")
      .trim()
      .notEmpty().withMessage("Nomor Identitas Penerima tidak boleh kosong.")
      .isNumeric().withMessage("Nomor Identitas Penerima harus berupa angka."),
    body("detail_fasilitas")
      .isArray({ min: 1 })
      .withMessage("Fasilitas paket tidak boleh kosong.")
      .custom(validation.check_mst_paket)
  ],
  controllers.addHandoverFasilitasPaket
);

router.post(
  "/daftar-jamaah-paket/add-handover-barang",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID transaksi paket tidak boleh kosong.")
      .isInt().withMessage("ID transaksi paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    body("barangList")
      .isArray({ min: 1 }).withMessage("Barang tidak boleh kosong.")
      .customSanitizer((value) => {
        return value.map((v) => v.trim().toUpperCase());
      }),
    body("giver_handover")
      .trim()
      .notEmpty().withMessage("Pemberi Handover tidak boleh kosong.")
      .toUpperCase(),
    body("giver_handover_identity")
      .trim()
      .notEmpty().withMessage("Nomor Identitas Pemberi Handover tidak boleh kosong.")
      .isNumeric().withMessage("Nomor Identitas Pemberi Handover harus berupa angka."),
    body("giver_handover_hp")
      .trim()
      .notEmpty().withMessage("Nomor HP Pemberi Handover tidak boleh kosong.")
      .isNumeric().withMessage("Nomor HP Pemberi Handover harus berupa angka."),
    body("giver_handover_address")
      .trim()
      .notEmpty().withMessage("Alamat Pemberi Handover tidak boleh kosong.")
      .toUpperCase(),
  ],
  controllers.addHandoverBarangPaket
)

router.post(
  "/daftar-jamaah-paket/pengembalian-handover-barang",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID transaksi paket tidak boleh kosong.")
      .isInt().withMessage("ID transaksi paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    body("selectedItems")
      .isArray({ min: 1 }).withMessage("ID items tidak boleh kosong.")
      .custom(validation.check_id_handover_barang),
    body("receiver_returned")
      .trim()
      .notEmpty().withMessage("Nama Penerima Barang tidak boleh kosong.")
      .toUpperCase(),
    body("receiver_returned_identity")
      .trim()
      .notEmpty().withMessage("Nomor Identitas Penerima Barang tidak boleh kosong.")
      .isNumeric().withMessage("Nomor Identitas Penerima Barang harus berupa angka."),
    body("receiver_returned_hp")
      .trim()
      .notEmpty().withMessage("Nomor HP Penerima Barang tidak boleh kosong.")
      .isNumeric().withMessage("Nomor HP Penerima Barang harus berupa angka."),
    body("receiver_returned_address")
      .trim()
      .notEmpty().withMessage("Alamat Penerima Barang tidak boleh kosong.")
      .toUpperCase(),
  ],
  controllers.pengembalianHandoverBarangPaket
)

router.post(
  "/daftar-jamaah-paket/get-info-pengembalian-handover-barang",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID transaksi paket tidak boleh kosong.")
      .isInt().withMessage("ID transaksi paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
  ],
  controllers.getInfoPengembalianHandoverBarangPaket
)

module.exports = router;
