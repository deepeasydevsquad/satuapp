const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_bank/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_bank");

const router = express.Router();

router.post(
  "/daftar-bank/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarBank
);

router.post(
  "/daftar-bank/add",
  authenticateToken,
  [
    body("kode").trim().toUpperCase().notEmpty().withMessage("Kode bank tidak boleh kosong.").isLength({ min: 3, max: 3 }).withMessage("Kode bank harus terdiri dari 3 huruf.").custom(validation.check_add_kode_bank),
    body("name").trim().notEmpty().withMessage("Nama bank tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/daftar-bank/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID bank tidak boleh kosong.").isInt().withMessage("ID bank harus berupa angka.").custom(validation.check_id_bank),
    body("kode").trim().toUpperCase().notEmpty().withMessage("Kode bank tidak boleh kosong.").isLength({ min: 3, max: 3 }).withMessage("Kode bank harus terdiri dari 3 huruf.").custom(validation.check_edit_kode_bank),
    body("name").trim().notEmpty().withMessage("Nama bank tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/daftar-bank/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID bank tidak boleh kosong.").isInt().withMessage("ID bank harus berupa angka.").custom(validation.check_id_bank)],
  controllers.delete
);

module.exports = router;
