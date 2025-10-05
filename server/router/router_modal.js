const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/modal/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/param");

const router = express.Router();

router.post("/modal/list",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang_id),
    body("periode").trim().notEmpty().withMessage("Periode tidak boleh kosong.").custom(validation.check_periode_id),
  ],
  controllers.list
);


module.exports = router;
