const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/profile/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const  validation  = require("../validation/profile.js"); 

const router = express.Router();

router.get(
  "/profile", 
  authenticateToken, 
  controllers.getProfile
);


router.put(
  "/profile",
  authenticateToken,
  validation.updateProfile, 
  controllers.updateProfile
);


router.put(
  "/profile/change-password",
  authenticateToken,
  validation.changePassword,
  controllers.changePassword
);

module.exports = router;