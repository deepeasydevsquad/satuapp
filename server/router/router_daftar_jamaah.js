const express = require("express");
const { body } = require("express-validator");
const controller = require("../modules/daftar_jamaah/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/daftar_jamaah");

const router = express.Router();

router.post(
  "/daftar-jamaah/get-agen",
  authenticateToken,
  [
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controller.getAgen
)

router.post(
  "/daftar-jamaah/get-info-member",
  authenticateToken,
  [
    body("member_id")
      .trim()
      .notEmpty().withMessage("ID jamaah tidak boleh kosong.")
      .isInt().withMessage("ID jamaah harus berupa angka.")
      .custom(validation.check_id_member),
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controller.getInfoMember
)

router.post(
  "/daftar-jamaah/get-member-not-jamaah", 
  authenticateToken,
  [
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controller.getMemberNotJamaah
);

router.post(
  "/daftar-jamaah/get-jamaah-not-member", 
  authenticateToken,
  [
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  controller.getJamaahNotMember
);

router.post(
  "/daftar-jamaah/list",
  [
    body("pageNumber").trim(),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
    body("filterCabang").trim().notEmpty().withMessage("Filter Cabang tidak boleh kosong."),
  ],
  authenticateToken,
  controller.getJamaah
);

router.post(
  "/daftar-jamaah/download",
  [
    body("division_id")
      .trim()
      .notEmpty().withMessage("Cabang tidak boleh kosong.")
      .isInt().withMessage("Cabang harus berupa angka.")
      .custom(validation.check_id_cabang),
  ],
  authenticateToken,
  controller.downloadJamaah
);

router.post(
  "/daftar-jamaah/add",
  authenticateToken,
  validation.upload.single("photo"), // ⬅️ HARUS duluan
    (req, res, next) => {
    console.log('✅ After .single("photo") → req.file:', req.file);
    console.log('✅ After .single → req.body.photo:', req.body.photoPath);
    next();
  },
  [
    body('division_id').notEmpty().withMessage("Cabang wajib diisi").custom(validation.check_id_cabang),
    body("member_id").optional().custom(validation.check_id_member),
    body("kelurahan_id")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Kelurahan wajib diisi"),
    body("address")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Alamat wajib diisi"),
    body("fullname")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Fullname wajib diisi"),
    body("identity_number")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Nomor identitas wajib diisi"),
    body("identity_type")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Tipe identitas wajib diisi"),
    body("gender")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Jenis kelamin wajib diisi")
      .custom((value) => {
        const validGenders = ['laki_laki', 'perempuan'];
        if (!validGenders.includes(value)) {
          throw new Error("Jenis kelamin harus 'laki_laki' atau 'perempuan'");
        }
        return true;
      }),
    body("birth_place")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Tempat lahir wajib diisi"),
    body("birth_date")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Tanggal lahir wajib diisi"),
    body("whatsapp_number")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Nomor WhatsApp wajib diisi"),
    body("password")
      .if(body("member_id").not().exists())
      .notEmpty().withMessage("Password wajib jika tidak ada member"),
    body("confirm_password")
      .if(body("member_id").not().exists())
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Konfirmasi password tidak cocok");
        }
        return true;
      }),
    body("title").notEmpty().withMessage("Title wajib diisi"),
    body("nama_ayah").optional(),
    body("nama_passport").optional(),
    body("nomor_passport").optional(),
    body("tanggal_di_keluarkan_passport").optional(),
    body("tempat_di_keluarkan_passport").optional(),
    body("masa_berlaku_passport").optional(),
    body("kode_pos").optional(),
    body("nomor_telephone").optional(),
    body("email").isEmail().optional(),
    body("pengalaman_haji").optional().isInt(),
    body("tahun_haji").optional(),
    body("pengalaman_umrah").optional().isInt(),
    body("tahun_umrah").optional(),
    body("desease").optional(),
    body("last_education").optional(),
    body("blood_type").optional(),
    body("photo_4_6").optional(),
    body("photo_3_4").optional(),
    body("fc_passport").optional(),
    body("mst_pekerjaan_id").optional(),
    body("profession_instantion_name").optional(),
    body("profession_instantion_address").optional(),
    body("profession_instantion_telephone").optional(),
    body("fc_kk").optional(),
    body("fc_ktp").optional(),
    body("buku_nikah").optional(),
    body("akte_lahir").optional(),
    body("buku_kuning").optional(),
    body("keterangan").optional(),
    body("nama_keluarga").optional(),
    body("alamat_keluarga").optional(),
    body("telephone_keluarga").optional(),
    body("status_nikah").optional(),
    body("tanggal_nikah").optional(),
    body("kewarganegaraan").optional(),
  ],
  validation.removeUploadedFileOnValidationError,
  controller.addJamaah
);

router.post(
  "/daftar-jamaah/get-info-update",
  authenticateToken,
  [
    body("id").notEmpty().withMessage("ID jamaah wajib diisi").custom(validation.check_id_jamaah),
    body("division_id").notEmpty().withMessage("Cabang wajib diisi").custom(validation.check_id_cabang),
  ],
  controller.getInfoUpdate
)

router.post(
  "/daftar-jamaah/update",
  authenticateToken,
  validation.upload.single("photo"),
    (req, res, next) => {
    console.log('✅ After .single("photo") → req.file:', req.file);
    console.log('✅ After .single → req.body.photo:', req.body.photoPath);
    next();
  },
  [
    body('division_id').notEmpty().withMessage("Cabang wajib diisi").custom(validation.check_id_cabang),
    body("member_id").notEmpty().withMessage("Member ID wajib diisi").custom(validation.check_id_member),
    body("kelurahan_id").notEmpty().withMessage("Kelurahan wajib diisi"),
    body("address").notEmpty().withMessage("Alamat wajib diisi"),
    body("fullname").notEmpty().withMessage("Fullname wajib diisi"),
    body("identity_number").notEmpty().withMessage("Nomor identitas wajib diisi"),
    body("identity_type").notEmpty().withMessage("Tipe identitas wajib diisi"),
    body("gender")
      .notEmpty()
      .withMessage("Jenis kelamin wajib diisi")
      .custom((value) => {
        const validGenders = ['laki_laki', 'perempuan'];
        if (!validGenders.includes(value)) {
          throw new Error("Jenis kelamin harus 'laki_laki' atau 'perempuan'");
        }
        return true;
      }),
    body("birth_place").notEmpty().withMessage("Tempat lahir wajib diisi"),
    body("birth_date")
      .notEmpty()
      .withMessage("Tanggal lahir wajib diisi"),
    body("whatsapp_number").notEmpty().withMessage("Nomor WhatsApp wajib diisi"),
    body("password").optional(),
    body("confirm_password")
      .if(body("password").exists())
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Konfirmasi password tidak cocok");
        }
        return true;
      }),
    body("title").notEmpty().withMessage("Title wajib diisi"),
    body("nama_ayah").optional(),
    body("nama_passport").optional(),
    body("nomor_passport").optional(),
    body("tanggal_di_keluarkan_passport").optional(),
    body("tempat_di_keluarkan_passport").optional(),
    body("masa_berlaku_passport").optional(),
    body("kode_pos").optional(),
    body("nomor_telephone").optional(),
    body("email").isEmail().optional(),
    body("pengalaman_haji").optional().isInt(),
    body("tahun_haji").optional(),
    body("pengalaman_umrah").optional().isInt(),
    body("tahun_umrah").optional(),
    body("desease").optional(),
    body("last_education").optional(),
    body("blood_type").optional(),
    body("photo_4_6").optional(),
    body("photo_3_4").optional(),
    body("fc_passport").optional(),
    body("mst_pekerjaan_id").optional(),
    body("profession_instantion_name").optional(),
    body("profession_instantion_address").optional(),
    body("profession_instantion_telephone").optional(),
    body("fc_kk").optional(),
    body("fc_ktp").optional(),
    body("buku_nikah").optional(),
    body("akte_lahir").optional(),
    body("buku_kuning").optional(),
    body("keterangan").optional(),
    body("nama_keluarga").optional(),
    body("alamat_keluarga").optional(),
    body("telephone_keluarga").optional(),
    body("status_nikah").optional(),
    body("tanggal_nikah").optional(),
    body("kewarganegaraan").optional(),
  ],
  validation.removeUploadedFileOnValidationError,
  controller.editJamaah
);

router.post(
  "/daftar-jamaah/delete",
  authenticateToken,
  [
    body("id").notEmpty().withMessage("ID jamaah wajib diisi").custom(validation.check_id_jamaah),
    body("division_id").notEmpty().withMessage("Cabang wajib diisi").custom(validation.check_id_cabang),
  ],
  controller.deleteJamaah
);

module.exports = router;
