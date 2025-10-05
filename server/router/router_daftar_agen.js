const express = require("express");
const { body } = require("express-validator");
const { authenticateToken } = require("../middleware/authenticateToken");
const controllers = require("../modules/daftar_agen/controllers/index");
const validation = require("../validation/agen");
const router = express.Router();

// daftar agen
router.post("/agen/list", authenticateToken, 
    [
        body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong."),
        body("pageNumber").trim().notEmpty().withMessage("Page Number tidak boleh kosong."),
        body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
        body("search").trim(),
    ],
    controllers.list
);

router.post("/addAgen", authenticateToken, controllers.addAgen);

// delete agen
router.post("/agen/deleteAgen", authenticateToken, 
    [
        body("id").trim().notEmpty().withMessage("ID Agen tidak boleh kosong.").custom(validation.check_agen_id),
    ],
    controllers.delete
);

module.exports = router;
