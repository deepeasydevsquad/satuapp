const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/paket_agen/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/paket_agen");

const router = express.Router();

router.post("/paket/agen", 
    authenticateToken, 
    [
        body("paket_id").trim().notEmpty().withMessage("Paket ID tidak boleh kosong.").custom(validation.check_paket_id),
    ],
    controllers.daftar_agen);

module.exports = router;
