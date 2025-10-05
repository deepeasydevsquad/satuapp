const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/template_pesan_whatsapp/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.post(
  "/template-pesan-whatsapp/list",
  authenticateToken,
  controllers.daftar_template
);

router.post(
  "/template-pesan-whatsapp/by-id",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("id tidak boleh kosong.")],
  controllers.get_template_by_id
);

router.post(
  "/template-pesan-whatsapp/add-template-pesan-whatsapp",
  authenticateToken,
  [
    body("name").trim().notEmpty().withMessage("name tidak boleh kosong."),
    body("type").trim().notEmpty().withMessage("type tidak boleh kosong."),
    body("variable").notEmpty().withMessage("variable tidak boleh kosong."),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("message tidak boleh kosong."),
  ],
  controllers.add_template
);

router.post(
  "/template-pesan-whatsapp/update-template-pesan-whatsapp",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("id tidak boleh kosong."),
    body("name").trim().notEmpty().withMessage("name tidak boleh kosong."),
    body("type").trim().notEmpty().withMessage("type tidak boleh kosong."),
    body("variable").notEmpty().withMessage("variable tidak boleh kosong."),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("message tidak boleh kosong."),
  ],
  controllers.update_template
);
router.post(
  "/template-pesan-whatsapp/delete-template-pesan-whatsapp",
  authenticateToken,
  [body("id").trim().notEmpty().withMessage("id tidak boleh kosong.")],
  controllers.delete_template
);

module.exports = router;
