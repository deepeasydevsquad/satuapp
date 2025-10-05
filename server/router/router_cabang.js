const express = require("express");
const controller = require("../modules/cabang/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const upload = require("../validation/cabang");

const router = express.Router();

router.get("/get-cabang", authenticateToken, controller.get_cabang);
router.post(
  "/add-cabang",
  authenticateToken,
  upload.single("tanda_tangan"),
  controller.add
);
router.put(
  "/update-cabang/:id",
  authenticateToken,
  upload.single("tanda_tangan"),
  controller.update
);
router.delete("/delete-cabang/:id", authenticateToken, controller.delete);

router.get("/ambil-kota", authenticateToken, controller.daftarKota);

module.exports = router;
