const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/investor/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/investor");

const router = express.Router();


router.get(
  "/investor/info-add",
  authenticateToken,
  controllers.infoAdd
);

router.post(
  "/investor/info-edit",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Investor tidak boleh kosong.").custom(validation.check_id_investor),
  ],
  controllers.infoEdit
);

router.post(
  "/investor/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.list
);

router.post(
  "/investor/",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Investor tidak boleh kosong."),
    body("identity_number").trim().notEmpty().withMessage("Nomor Identitas Investor tidak boleh kosong."),
    body("mobile_phone").trim().notEmpty().withMessage("Nomor HP Investor tidak boleh kosong.").custom(validation.check_mobile_phone),
    body("address").trim().notEmpty().withMessage("Alamat Investor tidak boleh kosong."),
    body("invesment").trim().notEmpty().withMessage("Jumlah Investasi tidak boleh kosong."),
    body("stock").trim().notEmpty().withMessage("Jumlah Saham tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/investor/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Investor tidak boleh kosong.").custom(validation.check_id_investor),
    body("name").trim().notEmpty().withMessage("Nama Investor tidak boleh kosong."),
    body("identity_number").trim().notEmpty().withMessage("Nomor Identitas Investor tidak boleh kosong."),
    body("mobile_phone").trim().notEmpty().withMessage("Nomor HP Investor tidak boleh kosong.").custom(validation.check_mobile_phone),
    body("address").trim().notEmpty().withMessage("Alamat Investor tidak boleh kosong."),
    body("invesment").trim().notEmpty().withMessage("Jumlah Investasi tidak boleh kosong."),
    body("stock").trim().notEmpty().withMessage("Jumlah Saham tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/investor/delete",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Investor tidak boleh kosong.").custom(validation.check_id_investor),
  ],
  controllers.delete
);

module.exports = router;
