const express = require("express");
const { param, body } = require("express-validator");
const controllers = require("../modules/riwayat_deposit_maskapai/controllers");
const { authenticateToken } = require("../middleware/authenticateToken");
const validationCabang = require("../validation/param");
const validation = require("../validation/riwayat_deposit_maskapai");

const router = express.Router();

router.post(
  "/riwayat_deposit_maskapai/list",
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validationCabang.check_cabang_id),
    body("page").optional().isInt({ min: 1 }).withMessage("Page number must be an integer and at least 1"),
    body("perpage").optional().isInt({ min: 1 }).withMessage("Per page must be an integer and at least 1"),
    body("search").optional().trim(),
  ],
  controllers.list
);

router.post(
  `/riwayat_deposit_maskapai/add_info`,
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validationCabang.check_cabang_id),
  ], 
  controllers.info_add_deposit
);

router.post(
  `/riwayat_deposit_maskapai/add`,
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validationCabang.check_cabang_id),
    body("sumber_dana").trim().notEmpty().withMessage("Sumber Dana tidak boleh kosong.").custom(validation.check_sumber_dana),
    body("mst_airline_id").trim().notEmpty().withMessage("Maskapai tidak boleh kosong.").custom(validation.check_mst_airline_id),
    body("deposit").trim().notEmpty().withMessage("Deposit tidak boleh kosong.").custom(validation.check_deposit),
  ], 
  controllers.add_deposit
);

router.post(
  `/riwayat_deposit_maskapai/delete`,
  authenticateToken,
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validationCabang.check_cabang_id),
    body("id").trim().notEmpty().withMessage("ID riwayat deposit maskapai tidak boleh kosong.").custom(validation.check_id),
  ], 
  controllers.delete
);


module.exports = router;
