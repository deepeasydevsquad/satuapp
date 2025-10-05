const express = require("express");
const { body, query } = require("express-validator");
const controllers = require("../modules/trans_tiket/controllers/index");
const controller_r = require("../modules/refund_tiket/controllers/index");
const controller_r2 = require("../modules/reschelude_tiket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validationCabang  = require("../validation/param");
const validation  = require("../validation/trans_tiket");

const router = express.Router();

console.log("Controllers Object:", controllers);

router.post(
  "/trans_tiket/add_tiket",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
    body("kostumer").trim().isNumeric().withMessage("ID Kostumer harus berupa angka.").custom(validationCabang.check_kostumer),
    body("paket").trim().isNumeric().withMessage("ID Paket harus berupa angka.").custom(validationCabang.check_paket),
    body("maskapai").notEmpty().withMessage("Maskapai tidak boleh kosong.").isNumeric().withMessage("ID Maskapai harus berupa angka.").custom(validation.check_maskapai_id).custom(validation.check_ticketing),
    body("pax").notEmpty().withMessage("Pax tidak boleh kosong.").isNumeric().withMessage("Pax harus berupa angka."),
    body("kode_booking").notEmpty().withMessage("Kode Booking tidak boleh kosong."),
    body("tanggal_keberangkatan").notEmpty().withMessage("Tanggal Keberangkatan tidak boleh kosong."),
    body("tanggal_kepulangan").trim(),
    body("harga_travel").notEmpty().withMessage("Harga Travel tidak boleh kosong.").isNumeric().withMessage("Harga travel harus berupa angka."),
    body("harga_kostumer").notEmpty().withMessage("Harga Kostumer tidak boleh kosong."),
    body("dibayar"),
  ],
  controllers.addTiket
);

router.post(
  "/trans_tiket/get_info_pembayaran_ticket",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Transkasi Tiket tidak boleh kosong.").isNumeric().withMessage("ID Transaksi Tiket harus berupa angka.").custom(validation.check_id),
  ],
  controllers.getInfoPembayaranTiket
);

router.get(
  "/trans_tiket/generate_nomor_register",
  authenticateToken,
  controllers.generateNomorRegister
);

router.get(
  "/trans_tiket/generate_nomor_invoice",
  authenticateToken,
  controllers.generateNomorInvoice
);

router.post(
  "/trans_tiket/ticket_transactions",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
    body("pageNumber").trim().notEmpty().withMessage("Page Number tidak boleh kosong."),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getTicketTransactions
);

router.post(
  "/trans_tiket/get-airlines",
  authenticateToken,
  [
    body("cabang").notEmpty().withMessage("Cabang wajib diisi").custom(validationCabang.check_cabang_id),
  ],
  controllers.getAirlines
);

router.post(
  "/trans_tiket/add_pembayaran",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Transkasi Tiket tidak boleh kosong.").isNumeric().withMessage("ID Transaksi Tiket harus berupa angka.").custom(validation.check_id),
    body("dibayar").notEmpty().withMessage("Jumlah yang akan dibayarkan tidak boleh 0").isNumeric().withMessage("Jumlah dibayar harus berupa angka.").custom(validation.check_jumlah_dibayar),
  ],
  controllers.add_pembayaran_ticket
);

router.post(
  "/trans_tiket/detail",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Transkasi Tiket tidak boleh kosong.").isNumeric().withMessage("ID Transaksi Tiket harus berupa angka.").custom(validation.check_id),
  ],
  controllers.detail_ticket
);

router.post(
  "/trans_tiket/detail_refund",
  authenticateToken,
  [
    body("register_number")
      .notEmpty()
      .withMessage("Ticket Registrasi wajib diisi"),
  ],
  controller_r.refund_tiket_detail
);

router.post(
  "/trans_tiket/refund",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Transkasi Tiket tidak boleh kosong.").isNumeric().withMessage("ID Transaksi Tiket harus berupa angka.").custom(validation.check_id),
    body("refund").notEmpty().withMessage("Jumlah refund yang akan dibayarkan tidak boleh 0").isNumeric().withMessage("Jumlah refund harus berupa angka.").custom(validation.check_jumlah_refund),
    body("fee").trim(),
  ],
  controller_r.refund_tiket
);

router.post(
  "/trans_tiket/airlines_by_id",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Transkasi Tiket tidak boleh kosong.").isNumeric().withMessage("ID Transaksi Tiket harus berupa angka.").custom(validation.check_id),
  ],
  controllers.get_airlines_by_id
);

router.post(
  "/trans_tiket/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Transkasi Tiket tidak boleh kosong.").isNumeric().withMessage("ID Transaksi Tiket harus berupa angka.").custom(validation.check_id),
    body("tanggal_keberangkatan").trim().notEmpty().withMessage("Tanggal keberangkatan tidak boleh kosong."),
    body("kode_booking").trim().notEmpty().withMessage("Kode booking tidak boleh kosong."),
    body("maskapai").trim().notEmpty().withMessage("ID Maskapai tidak boleh kosong.").isNumeric().withMessage("ID Maskapai harus berupa angka.").custom(validation.check_maskapai_id).custom(validation.check_jumlah_saldo_maskapai),
    body("harga_travel").trim().notEmpty().withMessage("Harga travel tidak boleh kosong.").isNumeric().withMessage("Harga travel harus berupa angka."),
    body("harga_kostumer").trim().notEmpty().withMessage("Harga kostumer tidak boleh kosong.").isNumeric().withMessage("Harga kostumer harus berupa angka."),
    body("pax").trim().notEmpty().withMessage("Pax tidak boleh kosong.").isNumeric().withMessage("Pax harus berupa angka."),
  ],
  controllers.update
);

router.post(
  "/trans_tiket/delete",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Transkasi Tiket tidak boleh kosong.").isNumeric().withMessage("ID Transaksi Tiket harus berupa angka.").custom(validation.check_id),
  ],
  controllers.delete
);

router.post(
  "/trans_tiket/detail_reschedule",
  authenticateToken,
  [
    body("nomor_register")
      .notEmpty()
      .withMessage("Ticket Registrasi wajib diisi"),
  ],
  controller_r2.detail_reschedule
);

router.post(
  "/trans_tiket/reschedule",
  authenticateToken,
  [
    body("ticket_transaction_id")
      .notEmpty()
      .withMessage("ID transaksi tiket wajib diisi")
      .isInt()
      .withMessage("ID transaksi harus berupa angka"),

    body("details")
      .isArray({ min: 1 })
      .withMessage(
        "Detail reschedule wajib berbentuk array dan tidak boleh kosong"
      ),
    body("details.*.ticket_transaction_detail_id")
      .notEmpty()
      .withMessage("ID detail transaksi wajib diisi"),
    body("details.*.departure_date")
      .notEmpty()
      .withMessage("Tanggal keberangkatan baru wajib diisi"),
    body("details.*.travel_price")
      .notEmpty()
      .withMessage("Harga travel wajib diisi"),
    body("details.*.costumer_price")
      .notEmpty()
      .withMessage("Harga customer wajib diisi"),
    body("details.*.code_booking")
      .notEmpty()
      .withMessage("Kode booking wajib diisi"),
  ],
  controller_r2.reschelude
);

router.get(
  "/trans_tiket/daftar_customer",
  authenticateToken,
  controllers.daftar_customer
);

body("costumer_name").notEmpty().withMessage("Nama customer wajib diisi"),
  router.post(
    "/trans_tiket/daftar_paket",
    authenticateToken,
    [
      body("division_id")
        .trim()
        .notEmpty()
        .withMessage("ID  tidak boleh kosong."),
    ],
    controllers.daftar_paket
  );
module.exports = router;
