const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_transaksi_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_transaksi_paket");

const router = express.Router();

router.post(
  "/daftar-transaksi-paket/get-jamaah-transaksi-paket/list/",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),
    // body("division_id")
    //   .trim()
    //   .notEmpty().withMessage("ID Divisi tidak boleh kosong.")
    //   .isInt().withMessage("ID Divisi harus berupa angka.")
    //   .custom(validation.check_id_cabang),
  ],
  controllers.getJamaahTransaksiPaket
)

router.post(
  "/daftar-transaksi-paket/get-paket-types-transaksi-paket/list",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),
  ],
  controllers.getPaketTypes
);

router.post(
  "/daftar-transaksi-paket/get-agen-transaksi-paket",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Agen tidak boleh kosong.")
      .isInt().withMessage("ID Agen harus berupa angka."),
  ],
  controllers.getAgenById
)

router.post(
  "/daftar-transaksi-paket/get-daftar-transaksi-paket/list",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
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
  controllers.getDaftarTransaksiPaket
);

router.post(
  "/daftar-transaksi-paket/add-transaksi-paket",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),
    body("jamaah_id")
      .trim()
      .notEmpty().withMessage("ID Jamaah tidak boleh kosong.")
      .isInt().withMessage("ID Jamaah harus berupa angka."),
    body("paket_types_id")
      .trim()
      .notEmpty().withMessage("ID Paket Types tidak boleh kosong.")
      .isInt().withMessage("ID Paket Types harus berupa angka."),
  ],
  controllers.addTransaksiPaket
);

router.post(
  "/daftar-transaksi-paket/update-visa-transaksi-paket",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .isInt().withMessage("ID Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
    body("transpaketId")
      .trim()
      .notEmpty().withMessage("ID Transaksi Paket tidak boleh kosong.")
      .isInt().withMessage("ID Transaksi Paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    body("nomor_visa")
      .trim()
      .notEmpty().withMessage("Nomor Visa wajib diisi.")
      .isInt().withMessage("Nomor Visa harus berupa angka."),
    body("tanggal_berlaku_visa")
      .trim()
      .notEmpty().withMessage("Tanggal Berlaku Visa wajib diisi."),
    body("tanggal_berakhir_visa")
      .trim()
      .notEmpty().withMessage("Tanggal Berakhir Visa wajib diisi."),
  ],
  controllers.updateVisaTransaksiPaket
);

router.post(
  "/daftar-transaksi-paket/get-info-update-visa-transaksi-paket",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),
    body("transpaketId")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .isInt().withMessage("ID Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controllers.infoupdateVisaTransaksiPaket
)

router.post(
  "/daftar-transaksi-paket/refund-transaksi-paket",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .isInt().withMessage("ID Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
    body("transpaketId")
      .trim()
      .notEmpty().withMessage("ID Transaksi Paket tidak boleh kosong.")
      .isInt().withMessage("ID Transaksi Paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    body("nominal_refund")
      .trim()
      .notEmpty().withMessage("Nominal Refund tidak boleh kosong.")
      .isNumeric().withMessage("Nominal Refund harus berupa angka.")
      .custom((value) => {
        if (Number(value) <= 0) throw new Error("Nominal refund harus lebih dari 0.");
        return true;
      }),
  ],
  controllers.refundTransaksiPaket
)

router.post(
  "/daftar-transaksi-paket/get-info-refund-transaksi-paket",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),
    body("transpaketId")
      .trim()
      .notEmpty().withMessage("ID Transaksi Paket tidak boleh kosong.")
      .isInt().withMessage("ID Transaksi Paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .isInt().withMessage("ID Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controllers.inforefundTransaksiPaket
)

router.post(
  "/daftar-transaksi-paket/delete-transaksi-paket",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty().withMessage("ID Paket tidak boleh kosong.")
      .isInt().withMessage("ID Paket harus berupa angka.")
      .custom(validation.check_id_paket),
    body("transpaketId")
      .trim()
      .notEmpty().withMessage("ID Transaksi Paket tidak boleh kosong.")
      .isInt().withMessage("ID Transaksi Paket harus berupa angka.")
      .custom(validation.check_id_transpaket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .isInt().withMessage("ID Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controllers.deleteTransaksiPaket
);


module.exports = router;
