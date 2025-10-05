const express = require("express");
const { body } = require("express-validator");
const controller = require("../modules/data_master/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.get(
  "/get-provinsi",
  authenticateToken,
  controller.getProvinsi
);

router.post(
  "/get-kabupaten",
  authenticateToken,
  [
    body("provinsi_id")
      .trim()
      .notEmpty()
      .withMessage("Provinsi tidak boleh kosong.")
      .isInt()
      .withMessage("Provinsi harus berupa angka."),
  ],
  controller.getKabupaten
);

router.post(
  "/get-kecamatan",
  authenticateToken,
  [
    body("kabupaten_id")
      .trim()
      .notEmpty()
      .withMessage("Kabupaten tidak boleh kosong.")
      .isInt()
      .withMessage("Kabupaten harus berupa angka."),
  ],
  controller.getKecamatan
);

router.post(
  "/get-kelurahan",
  authenticateToken,
  [
    body("kecamatan_id")
      .trim()
      .notEmpty()
      .withMessage("Kecamatan tidak boleh kosong.")
      .isInt()
      .withMessage("Kecamatan harus berupa angka."),
  ],
  controller.getKelurahan
);

router.get(
  "/get-mahram",
  authenticateToken,
  controller.getMahram
);

router.get(
  "/get-pekerjaan",
  authenticateToken,
  controller.getPekerjaan
);

router.get(
  "/get-pendidikan",
  authenticateToken,
  controller.getPendiidikan
);

router.get(
  "/get-pengalaman",
  authenticateToken,
  controller.getPengalamanHajiUmrah
);

router.get  (
  "/get-kota",
  authenticateToken,
  controller.getKota
);

router.get(
  "/get-airlines",
  authenticateToken,
  controller.getAirlines
);

router.get(
  "/get-asuransi",
  authenticateToken,
  controller.getAsuransi
);

router.get(
  "/get-hotel",
  authenticateToken,
  controller.getHotel
);

router.get(
  "/get-bandara",
  authenticateToken,
  controller.getBandara
);

router.get(
  "/get-tipe-paket",
  authenticateToken,
  controller.getTipePaket
);

router.get(
  "/get-fasilitas",
  authenticateToken,
  controller.getFasilitas
);

router.get(
  "/get-provider-visa",
  authenticateToken,
  controller.getProviderVisa
);

module.exports = router;
