const express = require("express");
const controllers = require("../modules/level_agen/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const router = express.Router();

console.log("Controllers Object:", controllers);

router.get("/daftar-level-agen", authenticateToken, controllers.daftarLevelAgen);
router.post("/add-level-agen", authenticateToken, controllers.addAgen);
router.post("/update-level-agen", authenticateToken, controllers.updateAgen);
router.post("/delete-level-agen", authenticateToken, controllers.deleteAgen);

module.exports = router;
