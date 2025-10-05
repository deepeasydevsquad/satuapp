const express = require("express");
const router = express.Router();
const Controller = require("../modules/kwitansi/controllers/index"); // Pastik // Pastikan ini benar

console.log("Controller loaded:", Controller); // Debugging
router.get("/kwitansi/:order_id", Controller.getKwitansi);
router.get("/check-midtrans-status", Controller.checkMidtransStatus);
module.exports = router;
