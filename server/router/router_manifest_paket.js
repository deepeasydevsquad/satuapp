const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/manifest_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/manifest_paket");

const router = express.Router();

router.post(
  "/daftar-manifest-paket/get-daftar-manifest-paket/list",
  authenticateToken,
  [
    body("paketId")
      .trim()
      .notEmpty().withMessage("ID paket tidak boleh kosong.")
      .isInt().withMessage("ID paket harus berupa angka.")
      .custom(validation.check_id_paket),
    body("division_id")
      .trim()
      .notEmpty().withMessage("ID Cabang tidak boleh kosong.")
      .isInt().withMessage("ID Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
    body("pageNumber").trim(),
    body("perpage")
      .trim()
      .notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search")
      .trim()
  ],
  controllers.getDaftarManifestPaket
);

router.post(
  "/daftar-manifest-paket/download-manifest-paket",
  authenticateToken,
  [
    body("paketId").custom(validation.check_id_paket),
    body("division_id").custom(validation.check_id_cabang),
  ],
  controllers.downloadManifestPaket
);

module.exports = router;
