const express = require("express");
const { body, param } = require("express-validator");
const controller = require("../modules/item_fasilitas/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validationCabang = require("../validation/param");

const router = express.Router();

router.post(
  "/item_fasilitas/list",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validationCabang.check_cabang_id),
    body("pageNumber").trim().notEmpty().withMessage("Page Number tidak boleh kosong."),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
    body("status").trim(),
  ],
  controller.list
);

router.post(
  "/item_fasilitas/delete",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID tidak boleh kosong.")
  ],
  controller.hapus_stok
);

module.exports = router;
