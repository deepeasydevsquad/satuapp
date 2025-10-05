const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/neraca/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/param");

const router = express.Router();

router.post("/neraca/list",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang_id),
    body("periode").trim().notEmpty().withMessage("Periode tidak boleh kosong.").custom(validation.check_periode_id),
  ],
  controllers.list
);

router.post(
  "/neraca/download_data_neraca",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang_id),
    body("periode").trim().notEmpty().withMessage("Periode tidak boleh kosong.").custom(validation.check_periode_id),
  ],
  controllers.downloadDataNeraca
);

module.exports = router;
