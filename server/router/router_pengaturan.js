const express = require("express");
const { body, param } = require("express-validator");
const { authenticateToken } = require("../middleware/authenticateToken");
const controllers = require("../modules/pengaturan/controllers/index");
const router = express.Router();
const { validateCompanyUpdate, upload } = require("../validation/pengaturan");

router.put(
  "/update",
  authenticateToken,
  // validateCompanyUpdate,
  upload,
  controllers.updateCompanySettings
);

router.post("/company", authenticateToken, controllers.getCompanyInfo);

module.exports = router;
