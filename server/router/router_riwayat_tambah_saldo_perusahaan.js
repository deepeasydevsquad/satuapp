const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/request_tambah_saldo_perusahaan/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/request_tambah_saldo_perusahaan");

const router = express.Router();

router.post(
  "/riwayat_tambah_saldo_perusahaan/list",
  authenticateToken,
  [
    body("pageNumber")
      .trim()
      .notEmpty()
      .withMessage("Page Number tidak boleh kosong."),
    body("perpage")
      .trim()
      .notEmpty()
      .withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.list
);

router.get(
  "/riwayat_tambah_saldo_perusahaan/list_bank_transfer",
  authenticateToken,
  controllers.listBankTransfer
);

router.post(
  "/riwayat_tambah_saldo_perusahaan/add_deposit",
  authenticateToken,
  [
    body("bank_id")
      .trim()
      .notEmpty()
      .withMessage("Bank ID tidak boleh kosong.")
      .custom(validation.check_bank_id),
    body("nominal")
      .trim()
      .notEmpty()
      .withMessage("Jumlah Nominal tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/riwayat_tambah_saldo_perusahaan/get_info_edit",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("ID tidak boleh kosong.")
      .custom(validation.check_id),
  ],
  controllers.get_info_edit
);

router.post(
  "/riwayat_tambah_saldo_perusahaan/update_deposit",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("ID tidak boleh kosong.")
      .custom(validation.check_id),
    body("bank_id")
      .trim()
      .notEmpty()
      .withMessage("Bank ID tidak boleh kosong.")
      .custom(validation.check_bank_id),
    body("nominal")
      .trim()
      .notEmpty()
      .withMessage("Jumlah Nominal tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/riwayat_tambah_saldo_perusahaan/delete",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("ID tidak boleh kosong.")
      .custom(validation.check_id),
  ],
  controllers.delete
);

router.post(
  "/riwayat_tambah_saldo_perusahaan/sudah_dikirim",
  authenticateToken,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("ID tidak boleh kosong.")
      .custom(validation.check_id),
  ],
  controllers.sudah_dikirim
);

module.exports = router;
