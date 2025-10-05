const express = require("express");
const validasiPesanWhatsapp = require("../validation/pesan_whatsapp");
const { body } = require("express-validator");
const { authenticateToken } = require("../middleware/authenticateToken");
const controllers = require("../modules/pesan_whatsapp/controllers/index");
const router = express.Router();

router.post(
  "/pesan_whatsapp/add_pesan",
  authenticateToken,
  validasiPesanWhatsapp,
  controllers.add_pesan
);

router.post(
  "/pesan_whatsapp/get_data",
  authenticateToken,
  [body("type").trim().notEmpty().withMessage("Type tidak boleh kosong.")],
  controllers.get_data
);

router.post(
  "/pesan_whatsapp/get_message",
  authenticateToken,
  [body("template_id").trim().notEmpty().withMessage("ID tidak boleh kosong.")],
  controllers.get_message
);

router.post(
  "/pesan_whatsapp/delete_pesan",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID pesan tidak boleh kosong.")],
  controllers.delete_pesan
);

router.get(
  "/pesan_whatsapp/get_nomor_company",
  authenticateToken,
  controllers.get_nomor_company
);

router.post(
  "/pesan_whatsapp/daftar_pesan",
  authenticateToken,
  controllers.daftar_pesan
);

module.exports = router;
