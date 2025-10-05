const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/k_t/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/k_t");

const router = express.Router();


router.post(
  "/k_t/list",
  authenticateToken,
  [
    body("paket_id").trim().notEmpty().withMessage("Paket ID tidak boleh kosong.").custom(validation.check_paket_id),
  ],
  controllers.list
);

router.post(
  "/k_t/tutup-paket",
  authenticateToken,
  [
    body("paket_id").trim().notEmpty().withMessage("Paket ID tidak boleh kosong.").custom(validation.check_paket_id),
  ],
  controllers.tutupPaket
);

router.post(
  "/k_t/buka-paket",
  authenticateToken,
  [
    body("paket_id").trim().notEmpty().withMessage("Paket ID tidak boleh kosong.").custom(validation.check_paket_id),
  ],
  controllers.bukaPaket
);

 
module.exports = router;
