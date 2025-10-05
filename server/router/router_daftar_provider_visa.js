const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_provider_visa/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_provider_visa");

const router = express.Router();

router.post(
  "/daftar-provider-visa/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarProviderVisa
);

router.post(
  "/daftar-provider-visa/add",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("Nama Provider Visa tidak boleh kosong.").toUpperCase(),
  ],
  controllers.add
);

router.post(
  "/daftar-provider-visa/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Provider Visa tidak boleh kosong.").custom(validation.check_id_provider_visa),
    body("name").trim().notEmpty().withMessage("Nama Provider Visa tidak boleh kosong.").toUpperCase(),
  ],
  controllers.update
);

router.post(
  "/daftar-provider-visa/delete",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("ID Provider Visa tidak boleh kosong.").isInt().withMessage("ID Provider Visa harus berupa angka.").custom(validation.check_id_provider_visa)],
  controllers.delete
);

module.exports = router;
