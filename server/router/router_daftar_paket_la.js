const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/daftar_paket_la/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_paket_la");

const router = express.Router();


router.get(
  "/daftar-paket-la/get-daftar-kostumer",
  authenticateToken,
  controllers.getDaftarKostumer
)

router.post(
  "/daftar-paket-la/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.getDaftarPaketLa
);

router.post(
  "/daftar-paket-la/add",
  authenticateToken,
  [
    body("kostumer_id").trim().notEmpty().withMessage("ID Kostumer paket la tidak boleh kosong."),
    body("client_name").trim().notEmpty().withMessage("Nama Kostumer tidak boleh kosong."),
    body("client_hp_number").trim().notEmpty().withMessage("Nomor HP Kostumer tidak boleh kosong."),
    body("client_address").trim().notEmpty().withMessage("Alamat Kostumer tidak boleh kosong."),
    body("discount").trim().notEmpty().withMessage("Diskon tidak boleh kosong."),
    body("total_jamaah").trim().notEmpty().withMessage("Total Jamaah tidak boleh kosong."),
    body("departure_date").trim().notEmpty().withMessage("Tanggal Kebertanggungan tidak boleh kosong."),
    body("arrival_date").trim().notEmpty().withMessage("Tanggal Kepulangan tidak boleh kosong."),
  ],
  controllers.add
);

router.post(
  "/daftar-paket-la/update",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Paket LA tidak boleh kosong.").custom(validation.check_id_paket_la),
    body("client_name").trim().notEmpty().withMessage("Nama Kostumer tidak boleh kosong."),
    body("client_hp_number").trim().notEmpty().withMessage("Nomor HP Kostumer tidak boleh kosong."),
    body("client_address").trim().notEmpty().withMessage("Alamat Kostumer tidak boleh kosong."),
    // body("status").trim().notEmpty().withMessage("Status tidak boleh kosong."),
    body("discount").trim().notEmpty().withMessage("Diskon tidak boleh kosong."),
    body("total_jamaah").trim().notEmpty().withMessage("Total Jamaah tidak boleh kosong."),
    body("departure_date").trim().notEmpty().withMessage("Tanggal Kebertanggungan tidak boleh kosong."),
    body("arrival_date").trim().notEmpty().withMessage("Tanggal Kepulangan tidak boleh kosong."),
  ],
  controllers.update
);

router.post(
  "/daftar-paket-la/delete",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Kota tidak boleh kosong.").isInt().withMessage("ID Kota harus berupa angka.").custom(validation.check_id_paket_la),
  ],
  controllers.delete
);

module.exports = router;
