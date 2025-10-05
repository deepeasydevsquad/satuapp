const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/trans_fasilitas/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/trans_fasilitas");
const validationCabang  = require("../validation/param");

const router = express.Router();

router.post(
    "/trans_fasilitas/add_transaksi",
    authenticateToken,
    [
        body("kostumer_id").notEmpty().withMessage("Kostumer wajib diisi").custom(validation.check_id_kostumer),
        body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
        body("fasilitas").isArray({ min: 1 }).withMessage("Minimal 1 fasilitas harus diinput"),
        body("fasilitas.*.item_id").notEmpty().withMessage("Fasilitas wajib diisi").custom(validation.check_id_fasilitas),
    ],
    controllers.add_transaksi_fasilitas
);

router.post(
    "/trans_fasilitas/delete_transaksi",
    authenticateToken,
    [
        body("id").trim().notEmpty().withMessage("ID tidak boleh kosong.").custom(validation.check_id_transfasilitas),
    ],
    controllers.hapus_transaksi_fasilitas
);

router.post(
    "/trans_fasilitas/daftar_transaksi",
    authenticateToken,
    [
        body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").isNumeric().withMessage("ID Cabang harus berupa angka.").custom(validationCabang.check_cabang_id),
        body("perpage").optional().isInt().withMessage("Jumlah per halaman harus berupa angka."),
        body("pageNumber").optional().isInt().withMessage("Nomor halaman harus berupa angka."),
        body("search").optional().trim(),
    ],
    controllers.daftar_transaksi_fasilitas
);

router.get(
    "/trans_fasilitas/daftar_customer",
    authenticateToken,
    controllers.daftar_customer
);

router.post(
    "/trans_fasilitas/daftar_paket",
    authenticateToken,
    [
        body("division_id").trim().notEmpty().withMessage("ID Cabang tidak boleh kosong.").custom(validation.check_id_cabang),
    ],
    controllers.daftar_paket
);

router.post(
    "/trans_fasilitas/daftar_fasilitas",
    authenticateToken,
    [
        body("division_id").trim().notEmpty().withMessage("ID Cabang tidak boleh kosong.").custom(validation.check_id_cabang)
    ],
    controllers.daftar_fasilitas
);

module.exports = router;