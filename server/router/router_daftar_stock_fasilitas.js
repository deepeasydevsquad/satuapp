const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/daftar_stock_fasilitas/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/sumber_dana");

const router = express.Router();

router.post(
  "/daftar-stock-fasilitas/list",
  authenticateToken,
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
  "/daftar-stock-fasilitas/add",
  authenticateToken,
  [
     body("cabang")
      .notEmpty()
      .withMessage("Cabang wajib diisi.")
      .isNumeric()
      .withMessage("Cabang harus berupa angka.").custom( validation.check_cabang ),
    body("jumlah")
      .notEmpty()
      .withMessage("Jumlah stok wajib diisi.")
      .isInt({ min: 1 })
      .withMessage("Jumlah stok harus berupa angka lebih dari 0."),
    body("mst_fasilitas_id")
      .notEmpty()
      .withMessage("ID fasilitas wajib diisi."),
    body("harga_beli")
      .notEmpty()
      .withMessage("Harga beli wajib diisi.")
      .isNumeric()
      .withMessage("Harga beli harus berupa angka.").custom( validation.check_jumlah_dana ),
    body("harga_jual")
      .notEmpty()
      .withMessage("Harga jual wajib diisi.")
      .isNumeric()
      .withMessage("Harga jual harus berupa angka."),
    body("sumber_dana")
      .notEmpty()
      .withMessage("Sumber Dana wajib diisi.")
      .isNumeric()
      .withMessage("Sumber Dana harus berupa angka.").custom( validation.sumber_dana ), 
  ],
  controllers.add_stock
);

router.post(
  "/sumber-dana/list",
  authenticateToken,
  [
      body("cabang")
      .notEmpty()
      .withMessage("Cabang wajib diisi.")
      .isNumeric()
      .withMessage("Cabang harus berupa angka.").custom( validation.check_cabang ), 
  ],
  controllers.sumber_dana
);

module.exports = router;
