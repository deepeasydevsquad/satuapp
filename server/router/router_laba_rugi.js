const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/laba_rugi/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/param");

const router = express.Router();

router.post("/laba_rugi/list",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang_id),
    body("periode").trim().notEmpty().withMessage("Periode tidak boleh kosong.").custom(validation.check_periode_id),
  ],
  controllers.list
);

router.post(
  "/laba_rugi/download_data_laba_rugi",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang_id),
    body("periode").trim().notEmpty().withMessage("Periode tidak boleh kosong.").custom(validation.check_periode_id),
  ],
  controllers.downloadDataLabaRugi
);

module.exports = router;
