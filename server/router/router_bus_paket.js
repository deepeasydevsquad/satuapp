const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/bus_paket/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const validation = require("../validation/bus_paket.js");

const router = express.Router();

router.post(
  "/daftar-bus-paket/get-bus-paket/list",
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
      .notEmpty()
      .withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
    body("filter").trim(),
  ],
  controllers.getDaftarBusPaket
);

router.post(
  "/daftar-bus-paket/get-available-jamaah",
  authenticateToken,
  [
    body("id").trim().custom(validation.check_id_bus),
    body("paket_id").trim().notEmpty().withMessage("Paket ID tidak boleh kosong.").custom(validation.check_id_paket),
    body("division_id").trim().notEmpty().withMessage("Division ID tidak boleh kosong.").custom(validation.check_id_cabang),
  ],
  controllers.getAvailableJamaahForForm
);

// Tambahkan route baru untuk mengambil daftar kota
router.get(
  "/daftar-bus-paket/get-cities",
  authenticateToken,
  controllers.getAllCities
);

router.post(
  "/daftar-bus-paket/create-bus",
  authenticateToken,
  // validation.createBus,
  controllers.createBusPaket
);

router.get(
  "/daftar-bus-paket/:id",
  authenticateToken,
  [param("id").isInt().withMessage("ID bus tidak valid.")],
  controllers.getBusById
);

// RUTE BARU: Memperbarui data satu bus berdasarkan ID
router.put(
  "/daftar-bus-paket/:id",
  authenticateToken,
  [
    param("id").isInt().withMessage("ID bus tidak valid."),
    // ...validation.createBus,
  ],
  controllers.updateBusById
);

router.delete(
  "/daftar-bus-paket/:id",
  authenticateToken,
  [param("id").isInt().withMessage("ID bus tidak valid.")],
  controllers.deleteBusById
);

module.exports = router;
