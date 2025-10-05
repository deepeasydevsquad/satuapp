const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/fasilitas_paket_la/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/fasilitas_paket_la");

const router = express.Router();

router.post(
  "/fasilitas_paket_la/list",
  authenticateToken,
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.get_fasilitas_paket_la
);

router.post(
  "/fasilitas_paket_la",
  authenticateToken,
  [
    body("paketlaId")
      .trim()
      .notEmpty().withMessage("ID Paket LA tidak boleh kosong.")
      .isInt().withMessage("ID Paket LA harus berupa angka.")
      .custom(validation.check_id_paket_la),

    body("items")
      .isArray()
      .withMessage("Items harus berupa array.")
      .notEmpty()
      .withMessage("Items tidak boleh kosong."),

    body("items.*.description")
      .trim()
      .notEmpty()
      .withMessage("Deskripsi tidak boleh kosong."),

    body("items.*.check_in")
      .trim()
      .notEmpty()
      .withMessage("Check-in tidak boleh kosong."),

    body("items.*.check_out")
      .trim()
      .notEmpty()
      .withMessage("Check-out tidak boleh kosong."),

    body("items.*.day")
      .trim()
      .notEmpty()
      .withMessage("Day tidak boleh kosong.")
      .isInt()
      .withMessage("Day harus berupa angka.")
      .custom((value) => value > 0)
      .withMessage("Day harus lebih besar dari 0."),

    body("items.*.pax")
      .trim()
      .notEmpty()
      .withMessage("Pax tidak boleh kosong.")
      .isInt()
      .withMessage("Pax harus berupa angka.")
      .custom((value) => value > 0)
      .withMessage("Pax harus lebih besar dari 0."),

    body("items.*.price")
      .trim()
      .notEmpty()
      .withMessage("Price tidak boleh kosong.")
      .isFloat()
      .withMessage("Price harus berupa angka.")
      .custom((value) => value > 0)
      .withMessage("Price harus lebih besar dari 0."),
  ],
  controllers.add
);

// router.post(
//   "/fasilitas_paket_la/update",
//   authenticateToken,
//   [
//     body("id").trim().notEmpty().withMessage("ID Fasilitas Paket LA tidak boleh kosong.").isInt().withMessage("ID Fasilitas Paket LA harus berupa angka.").custom(validation.check_id_fasilitas_paket_la),
//     body("register_number").trim().notEmpty().withMessage("Nomor Registrasi Paket LA tidak boleh kosong.").custom(validation.check_register_number),
//   ],
//   controllers.update
// );

router.post(
  "/fasilitas_paket_la/delete",
  authenticateToken,
  [
    body("itemId")
      .trim()
      .notEmpty().withMessage("ID Item tidak boleh kosong.")
      .isInt().withMessage("ID Item harus berupa angka.")
      .custom(validation.check_id_detail_fasilitas_paket_la),

    body("fasilitaspaketlaId")
      .trim()
      .notEmpty().withMessage("ID Fasilitas Paket LA tidak boleh kosong.")
      .isInt().withMessage("ID Fasilitas Paket LA harus berupa angka.")
      .custom(validation.check_id_fasilitas_paket_la),
  ],
  controllers.delete
);



module.exports = router;
