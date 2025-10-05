const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/sistem_log/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const router = express.Router();

router.post("/sistem_log/list", 
    authenticateToken, 
    [
        body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong."),
        body("pageNumber").trim().notEmpty().withMessage("Page Number tidak boleh kosong."),
        body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
        body("search").trim(),
    ],
    controllers.get_sistem_log
);

module.exports = router;
