const { body } = require("express-validator");

const validasiKonfigurasiSurat = [
  body("nama_tanda_tangan")
    .trim()
    .notEmpty()
    .withMessage("Nama tanda tangan wajib diisi")
    .isLength({ max: 255 })
    .withMessage("Nama tanda tangan maksimal 255 karakter"),

  body("jabatan_tanda_tangan")
    .trim()
    .notEmpty()
    .withMessage("Jabatan tanda tangan wajib diisi")
    .isLength({ max: 255 })
    .withMessage("Jabatan tanda tangan maksimal 255 karakter"),

  body("alamat_tanda_tangan")
    .trim()
    .notEmpty()
    .withMessage("Alamat tanda tangan wajib diisi")
    .isLength({ max: 500 })
    .withMessage("Alamat tanda tangan maksimal 500 karakter"),

  body("nama_perusahaan")
    .trim()
    .notEmpty()
    .withMessage("Nama perusahaan wajib diisi")
    .isLength({ max: 255 })
    .withMessage("Nama perusahaan maksimal 255 karakter"),

  body("izin_perusahaan")
    .trim()
    .notEmpty()
    .withMessage("Izin perusahaan wajib diisi")
    .isLength({ max: 100 })
    .withMessage("Izin perusahaan maksimal 100 karakter"),

  body("kota_perusahaan")
    .trim()
    .notEmpty()
    .withMessage("Kota perusahaan wajib diisi")
    .isLength({ max: 100 })
    .withMessage("Kota perusahaan maksimal 100 karakter"),

  body("provinsi_perusahaan")
    .trim()
    .notEmpty()
    .withMessage("Provinsi perusahaan wajib diisi")
    .isLength({ max: 100 })
    .withMessage("Provinsi perusahaan maksimal 100 karakter"),

  body("alamat_perusahaan")
    .trim()
    .notEmpty()
    .withMessage("Alamat perusahaan wajib diisi")
    .isLength({ max: 500 })
    .withMessage("Alamat perusahaan maksimal 500 karakter"),

  body("no_kontak_perusahaan")
    .trim()
    .notEmpty()
    .withMessage("No kontak perusahaan wajib diisi")
    .isLength({ max: 50 })
    .withMessage("No kontak perusahaan maksimal 50 karakter"),

  body("website_perusahaan")
    .optional({ checkFalsy: true }) // boleh kosong
    .isURL()
    .withMessage("Website perusahaan harus URL yang valid"),

  body("email_perusahaan")
    .trim()
    .notEmpty()
    .withMessage("Email perusahaan wajib diisi")
    .isEmail()
    .withMessage("Email perusahaan harus format email valid"),
];

module.exports = validasiKonfigurasiSurat;
