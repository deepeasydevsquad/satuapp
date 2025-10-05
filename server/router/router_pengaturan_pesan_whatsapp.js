const express = require("express");
const { authenticateToken } = require("../middleware/authenticateToken");
const controllers = require("../modules/pengaturan_pesan_whatsapp/controllers/index");
const {
  validatePengaturanWhatsapp,
} = require("../validation/pengaturan_whatsapp");
const router = express.Router();

router.post(
  "/update_pengaturan_whatsapp",
  authenticateToken,
  validatePengaturanWhatsapp(),
  controllers.update_pengaturan_whatsapp
);

router.post("/get_key", authenticateToken, controllers.get_key);

router.post("/check_koneksi", authenticateToken, controllers.check_koneksi);

module.exports = router;
