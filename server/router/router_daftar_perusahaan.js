const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/daftar_perusahaan/controllers/index");
const validation = require("../validation/daftar_perusahaan");
const {
  authenticateTokenBackbone,
} = require("../middleware/authenticateToken");

const router = express.Router();

router.post(
  "/backbone/daftar_perusahaan/list",
  authenticateTokenBackbone,
  [
    body("pageNumber").trim(),
    body("perpage")
      .trim()
      .notEmpty()
      .withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.list
);

router.post(
  "/backbone/daftar_perusahaan/add",
  authenticateTokenBackbone,
  [
    body("company_name").trim(),
    body("type")
      .trim()
      .notEmpty()
      .withMessage("Tipe tidak boleh kosong.")
      .isIn(["limited", "unlimited"])
      .withMessage("Format tipe perusahaan tidak ditemukan."),
    body("whatsapp_company_number")
      .trim()
      .notEmpty()
      .withMessage("Nomor whatsapp tidak boleh kosong.")
      .custom(validation.check_nomor_whatsapp),
    body("start_subscribtion").trim(),
    body("end_subscribtion").trim(),
    body("email").trim().custom(validation.check_email),
    body("saldo").trim(),
    body("username").trim().custom(validation.check_username),
    body("password").trim(),
  ],
  controllers.add
);

router.post(
  "/backbone/daftar_perusahaan/update",
  authenticateTokenBackbone,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("Id tidak boleh kosong.")
      .custom(validation.check_id),
    body("company_name").trim(),
    body("type")
      .trim()
      .notEmpty()
      .withMessage("Tipe tidak boleh kosong.")
      .isIn(["limited", "unlimited"])
      .withMessage("Format tipe perusahaan tidak ditemukan."),
    body("whatsapp_company_number")
      .trim()
      .notEmpty()
      .withMessage("Nomor whatsapp tidak boleh kosong.")
      .custom(validation.check_nomor_whatsapp_update),
    body("start_subscribtion").trim(),
    body("end_subscribtion").trim(),
    body("email").trim().custom(validation.check_email_update),
    body("saldo").trim(),
    body("username").trim().custom(validation.check_username_update),
    body("password").trim(),
  ],
  controllers.update
);

router.post(
  "/backbone/daftar_perusahaan/delete",
  authenticateTokenBackbone,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("Id tidak boleh kosong.")
      .custom(validation.check_id),
  ],
  controllers.delete
);

router.post(
  "/backbone/daftar_perusahaan/get_data_edit_perusahaan",
  authenticateTokenBackbone,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("Id tidak boleh kosong.")
      .custom(validation.check_id),
  ],
  controllers.get_data_edit_perusahaan
);

router.post(
  "/backbone/daftar_perusahaan/add_waktu_berlangganan",
  authenticateTokenBackbone,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("Id tidak boleh kosong.")
      .custom(validation.check_id),
    body("durasi")
      .trim()
      .notEmpty()
      .withMessage("Saldo tidak boleh kosong.")
      .isInt({ gt: 0 })
      .withMessage("Durasi harus lebih besar dari 0."),
  ],
  controllers.add_waktu_berlangganan
);

router.post(
  "/backbone/daftar_perusahaan/tambah_saldo",
  authenticateTokenBackbone,
  [
    body("id")
      .trim()
      .notEmpty()
      .withMessage("Id tidak boleh kosong.")
      .custom(validation.check_id),
    body("saldo")
      .trim()
      .notEmpty()
      .withMessage("Saldo tidak boleh kosong.")
      .isInt({ gt: 0 })
      .withMessage("Saldo harus lebih besar dari 0."),
  ],
  controllers.tambah_saldo
);

//

module.exports = router;
