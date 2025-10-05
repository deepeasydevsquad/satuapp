const { body } = require("express-validator");

const validasiPesanWhatsapp = [
  body("nomor_asal")
    .trim()
    .notEmpty()
    .withMessage("Nomor asal tidak boleh kosong."),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type tidak boleh kosong.")
    .isIn([
      "pesan_biasa",
      "semua_jamaah",
      "staff",
      "agen",
      "jamaah_tabungan",
      "jamaah_utang_koperasi",
      "jamaah_paket",
      "jamaah_sudah_berangkat",
    ])
    .withMessage("Type tidak valid."),

  body("pesan").trim().notEmpty().withMessage("Pesan tidak boleh kosong."),

  body("whatsapp_template_id").optional().trim(),

  // Custom validator buat 'nomor_tujuan' kalau type == pesan_biasa
  body("nomor_tujuan").custom((value, { req }) => {
    if (req.body.type === "pesan_biasa") {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        throw new Error("Nomor tujuan harus diisi untuk tipe pesan_biasa.");
      }
      if (typeof value !== "string" && !Array.isArray(value)) {
        throw new Error("Nomor tujuan harus berupa string atau array.");
      }
    }
    return true;
  }),
];

module.exports = validasiPesanWhatsapp;
