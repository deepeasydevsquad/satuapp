const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/permintaan_deposit_member/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/permintaan_deposit_member");

const router = express.Router();

router.post(
    "/permintaan-deposit-member/daftar-permintaan-deposit-member",
    authenticateToken,
    [
        body("search").trim(),
        body("perpage").isInt().withMessage("Jumlah Per Page harus berupa angka."),
        body("pageNumber").isInt().withMessage("Page Number harus berupa angka.")
    ],
    controllers.daftarPermintaanDepositMember
);

router.post(
    "/permintaan-deposit-member/update-request-deposit-member",
    authenticateToken,
    [
        body("id")
            .notEmpty().withMessage("ID Permintaan Deposit tidak boleh kosong.")
            .isInt().withMessage("ID Permintaan Deposit harus berupa angka.")
            .custom(validation.check_id_permintaan_deposit_member_sudah_dikirim),
        body("status")
            .notEmpty().withMessage("Status tidak boleh kosong.")
            .isIn(["disetujui", "ditolak"]).withMessage("Status harus 'disetujui' atau 'ditolak'.")
    ],
    controllers.updateStatusRequestDepositMember
);

router.post(
    "/permintaan-deposit-member/delete-request-deposit-member",
    authenticateToken,
    [
        body("id")
            .notEmpty().withMessage("ID Permintaan Deposit tidak boleh kosong.")
            .isInt().withMessage("ID Permintaan Deposit harus berupa angka.")
            .custom(validation.check_id_permintaan_deposit_member),
    ],
    controllers.deleteRequestDepositMember
);

module.exports = router;

