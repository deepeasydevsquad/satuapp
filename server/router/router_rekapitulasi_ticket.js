const express = require("express");
const { param, body } = require("express-validator");
const controllers = require("../modules/rekapitulasi_ticket/controllers");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/rekapitulasi_ticket");

const router = express.Router();

router.post(
  "/rekapitulasi-ticket/daftar-tiket",
  authenticateToken,
  [
    body("search").optional().trim(),
  ],
  controllers.getTicketTersedia
);

router.post(
  "/rekapitulasi-ticket/daftar-rekapitulasi-ticket",
  authenticateToken,
  [
    body("page").optional().isInt({ min: 1 }).withMessage("Page number must be an integer and at least 1"),
    body("perpage").optional().isInt({ min: 1 }).withMessage("Per page must be an integer and at least 1"),
    body("search").optional().trim(),
  ],
  controllers.daftarRekapitulasiTicket
);

router.post(
  "/rekapitulasi-ticket/create",
  authenticateToken,
  [
    body("costumer_name").notEmpty().withMessage("Nama Kostumer wajib diisi."),
    body("costumer_whatsapp_number").notEmpty().withMessage("No. WhatsApp wajib diisi."),
    body("ticket_transaction_ids")
      .notEmpty().withMessage("ID Transaksi Tiket tidak boleh kosong.")
      .isArray().withMessage("ID Transaksi Tiket harus berupa array.")
      .custom(validation.check_id_transaksi_ticket),
  ],
  controllers.addRekapitulasi
);

router.post(
  "/rekapitulasi-ticket/delete",
  authenticateToken,
  [
    body("id").notEmpty().isInt({ min: 1 }).withMessage("ID Rekapitulasi harus berupa angka positif.").custom(validation.check_id_rekapitulasi_ticket),
  ],
  controllers.deleteRekapitulasi
);

router.get(
  `/rekapitulasi-ticket/cetak/:regnumb`,
  authenticateToken,
  [
    param("regnumb").notEmpty().custom(validation.check_register_number_ticket),
  ],
  controllers.cetakDataRekapByRegnumb
);

module.exports = router;
