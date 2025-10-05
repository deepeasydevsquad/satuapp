const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/headline/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/headline");

const router = express.Router();

router.post(
    "/headline/daftar-headline",
    authenticateToken,
    [
        body("search").trim(),
        body("perpage").isInt().withMessage("Jumlah Per Page harus berupa angka."),
        body("pageNumber").isInt().withMessage("Page Number harus berupa angka.")
    ],
    controllers.daftarHeadline
);

router.post(
    "/headline/add-headline",
    authenticateToken,
    [
        body("headline")
            .trim()
            .notEmpty().withMessage("Judul Headline tidak boleh kosong."),
        body("tampilkan")
            .trim()
            .notEmpty().withMessage("Status Publish Headline tidak boleh kosong.")
            .isIn(["Ya", "Tidak"]).withMessage("Status Publish Headline harus berupa ya atau tidak."),
    ],
    controllers.addHeadline
);

router.post(
    "/headline/fetch-headline",
    authenticateToken,
    [
        body("id")
            .trim()
            .notEmpty().withMessage("ID Headline tidak boleh kosong.")
            .isInt().withMessage("ID Headline harus berupa angka.")
            .custom(validation.check_headline_id),
    ],
    controllers.fetchHeadline
);

router.post(
    "/headline/update-headline",
    authenticateToken,
    [
        body("id")
            .notEmpty().withMessage("ID Headline tidak boleh kosong.")
            .isInt().withMessage("ID Headline harus berupa angka.")
            .custom(validation.check_headline_id),
        body("headline")
            .trim()
            .notEmpty().withMessage("Judul Headline tidak boleh kosong."),
        body("tampilkan")
            .trim()
            .notEmpty().withMessage("Status Publish Headline tidak boleh kosong.")
            .isIn(["Ya", "Tidak"]).withMessage("Status Publish Headline harus berupa ya atau tidak."),
    ],
    controllers.updateHeadline
);

router.post(
    "/headline/delete-headline",
    authenticateToken,
    [
        body("id")
            .notEmpty().withMessage("ID Headline tidak boleh kosong.")
            .isInt().withMessage("ID Headline harus berupa angka.")
            .custom(validation.check_headline_id),
    ],
    controllers.deleteHeadline
);

module.exports = router;

