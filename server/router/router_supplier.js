const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/supplier/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/supplier");

const router = express.Router();

router.get(
  "/supplier/get-bank",
  authenticateToken,
  controllers.getDaftarBank
)

router.post(
  "/supplier/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarSupplier
);

router.post(
  "/supplier/add",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama supplier tidak boleh kosong."),
    body("address").trim().notEmpty().withMessage("Alamat supplier tidak boleh kosong."),
    body("bank_id").trim().notEmpty().withMessage("Bank supplier tidak boleh kosong.").custom(validation.check_id_bank_supplier),
    body("nomor_rekening").trim().notEmpty().withMessage("Nomor rekening supplier tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/supplier/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID supplier tidak boleh kosong.").isInt().withMessage("ID supplier harus berupa angka.").custom(validation.check_id_supplier),
    body("name").trim().notEmpty().withMessage("Nama supplier tidak boleh kosong."),
    body("address").trim().notEmpty().withMessage("Alamat supplier tidak boleh kosong."),
    body("bank_id").trim().notEmpty().withMessage("Bank supplier tidak boleh kosong.").custom(validation.check_id_bank_supplier),
    body("nomor_rekening").trim().notEmpty().withMessage("Nomor rekening supplier tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/supplier/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID supplier tidak boleh kosong.").isInt().withMessage("ID supplier harus berupa angka.").custom(validation.check_id_supplier)],
  controllers.delete
);

module.exports = router;
