const { body } = require("express-validator");

const SuratValidator = () => [
  body("nomor_surat").notEmpty().withMessage("Nomor surat wajib diisi"),
  body("tipe_surat").notEmpty().withMessage("Tipe surat wajib diisi"),
  body("tanggal_surat").notEmpty().withMessage("Tanggal surat wajib diisi"),
  body("tujuan").notEmpty().withMessage("Tujuan wajib diisi"),

  body().custom((body) => {
    if (body.tipe_surat === "rekom_paspor") {
      if (!body.jamaah_id || !body.bulan_tahun_berangkat) {
        throw new Error(
          "Field 'jamaah_id' dan 'bulan_tahun_berangkat' wajib diisi"
        );
      }
    } else if (body.tipe_surat === "surat_cuti") {
      const fields = ["jamaah_id", "jabatan", "keberangkatan", "kepulangan"];
      const missing = fields.filter((f) => !body[f]);
      if (missing.length > 0) {
        throw new Error(`Field wajib untuk Surat Cuti: ${missing.join(", ")}`);
      }
    }
    return true;
  }),
];

module.exports = SuratValidator;
