const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_akun_bank/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/airlines");

const router = express.Router();

router.post(
  "/daftar_bank/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage")
      .trim()
      .notEmpty()
      .withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.daftar_bank
);

router.post(
  "/daftar_bank/by_id",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("id tidak boleh kosong.")],
  controllers.bank_by_id
);

router.get(
  "/daftar_bank/mst_bank",
  authenticateToken,
  controllers.daftar_mst_bank
);

router.post(
  "/daftar_bank/add",
  authenticateToken,
  [
    body("nama_akun")
      .trim()
      .notEmpty()
      .withMessage("nama akun tidak boleh kosong."),
    body("nomor_akun")
      .trim()
      .notEmpty()
      .withMessage("nomot akun tidak boleh kosong."),
    body("mst_bank_id")
      .trim()
      .notEmpty()
      .withMessage("mst bank tidak tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/daftar_bank/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("id akun tidak boleh kosong."),
    body("nama_akun")
      .trim()
      .notEmpty()
      .withMessage("nama akun tidak boleh kosong."),
    body("nomor_akun")
      .trim()
      .notEmpty()
      .withMessage("nomot akun tidak boleh kosong."),
    body("mst_bank_id")
      .trim()
      .notEmpty()
      .withMessage("mst bank tidak tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/daftar_bank/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("id tidak boleh kosong.")],
  controllers.delete
);

module.exports = router;
