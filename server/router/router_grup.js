const express = require("express");
const { body } = require("express-validator");
const controller = require("../modules/grup/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.get("/grup/get-menu", authenticateToken, controller.getMenu);
router.post("/grup/get-grup", 
    authenticateToken, 
    [
        body("pageNumber").trim().notEmpty().withMessage("Page Number tidak boleh kosong."),
        body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
        body("search").trim(),
    ],
   controller.getGrup
);
router.post("/grup/add-grup", authenticateToken, controller.addGrup);
router.put("/grup/update-grup/", authenticateToken, controller.updateGrup);
router.post("/grup/delete-grup/", authenticateToken, controller.deleteGrup);

module.exports = router;
