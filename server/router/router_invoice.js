const express = require("express");
const { body, param } = require("express-validator");
const controller = require("../modules/invoice/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
// const validation = require("../validation/invoice");

const router = express.Router();

router.get("/invoice/header", authenticateToken, controller.header);

router.post(
  "/invoice/cek-kwitansi-tabungan-umrah",
  authenticateToken,
  [
    body("invoice")
      .trim()
      .notEmpty()
      .withMessage("Invoice tidak boleh kosong."),
  ],
  controller.cek_kwitansi_tabungan_umrah
);

// invoice/kas_keluar_masuk/
router.get(
  "/invoice/kas-keluar-masuk/:invoice",
  authenticateToken,
  controller.invoice_kas_keluar_masuk
);

router.get(
  "/invoice/invoice-deposit/:invoice",
  authenticateToken,
  controller.invoice_deposit
);

router.get(
  "/invoice/invoice-paket-la/:invoice",
  authenticateToken,
  controller.invoice_paket_la
);

router.get(
  "/invoice/kwitansi-terakhir/:register_number",
  authenticateToken,
  controller.kwitansi_terakhir
);

router.get(
  "/invoice/pembayaran-perbulan/:invoice",
  authenticateToken,
  controller.invoice_pembayaran_perbulan
);

router.get(
  "/invoice/kwitansi-tabungan-umrah/:invoice",
  authenticateToken,
  controller.kwitansi_tabungan_umrah
);

router.get(
  "/invoice/kwitansi-handover-fasilitas/:invoice",
  authenticateToken,
  controller.kwitansi_handover_fasilitas
);

router.get(
  "/invoice/kwitansi-handover-barang/:invoice",
  authenticateToken,
  controller.kwitansi_handover_barang
);

router.get(
  "/invoice/kwitansi-pengembalian-handover-barang/:invoice",
  authenticateToken,
  controller.kwitansi_pengembalian_handover_barang
);

router.get(
  "/invoice/kwitansi-visa/:invoice",
  authenticateToken,
  controller.kwitansi_visa
);

router.get(
  "/invoice/pembayaran-fee-agen/:invoice",
  authenticateToken,
  controller.kwitansi_pembayaran_fee_agen
);

router.get(
  "/invoice/kwitansi-pembayaran-transaksi-paket-umrah/:invoice",
  authenticateToken,
  controller.kwitansi_pembayaran_transaksi_paket_umrah
);

router.get(
  "/invoice/kwitansi-trans-hotel/:invoice",
  authenticateToken,
  controller.kwitansi_trans_hotel
);

router.get(
  "/invoice/kwitansi-passport/:invoice",
  authenticateToken,
  controller.kwitansi_passport
);

router.get(
  "/invoice/kwitansi-handover-fasilitas-paket/:invoice",
  authenticateToken,
  controller.kwitansi_handover_fasilitas_paket
);

router.get(
  "/invoice/kwitansi-handover-barang-paket/:invoice",
  authenticateToken,
  controller.kwitansi_handover_barang_paket
);

router.get(
  "/invoice/kwitansi-pengembalian-handover-barang-paket/:invoice",
  authenticateToken,
  controller.kwitansi_pengembalian_handover_barang_paket
);

router.get(
  "/invoice/kwitansi-trans-transport/:invoice",
  authenticateToken,
  controller.kwitansi_trans_transport
);

router.get(
  "/invoice/kwitansi-trans-fasilitas/:invoice",
  authenticateToken,
  controller.kwitansi_trans_fasilitas
);

router.get(
  "/invoice/trans-tiket/:regnum",
  authenticateToken,
  controller.kwitansi_trans_ticket
);
router.get(
  "/invoice/refund-tiket/:invoice",
  authenticateToken,
  controller.kwitansi_refund
);

router.get(
  "/invoice/pembayaran-tiket/:invoice",
  authenticateToken,
  controller.kwitansi_pembayaran_tiket
);

module.exports = router;
