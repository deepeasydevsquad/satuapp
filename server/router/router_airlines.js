const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/airlines/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/airlines");

const router = express.Router();

router.post(
  "/airlines/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarAirlines
);

router.post(
  "/airlines/add",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Maskapai tidak boleh kosong.").toUpperCase(),
  ],
  controllers.add
);

router.post(
  "/airlines/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Maskapai tidak boleh kosong.").custom(validation.check_id_airlines),
    body("name").trim().notEmpty().withMessage("Nama Maskapai tidak boleh kosong.").toUpperCase(),
  ],
  controllers.update
);

router.post(
  "/airlines/delete",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Maskapai tidak boleh kosong.").isInt().withMessage("ID Maskapai harus berupa angka.").custom(validation.check_id_airlines).custom(validation.check_delete_is_allow)
  ],
  controllers.delete
);

module.exports = router;
