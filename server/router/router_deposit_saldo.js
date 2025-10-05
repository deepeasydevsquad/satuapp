const express = require("express");
const { body } = require("express-validator");
const controller = require("../modules/deposit_saldo/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

router.post(
  "/deposit_saldo/get-deposit",
  [
    body("cabang").trim(),
    body("pageNumber").trim(),
    body("perpage").trim(),
    body("search").trim(),
  ],
  authenticateToken,
  controller.getDeposit
);

// router.get("/get-company",
//     authenticateToken,
//     controller.getCompany
// );

router.post(
  "/deposit_saldo/add-deposit",
  authenticateToken,
  [
    body("memberId").notEmpty().withMessage("memberId wajib diisi").isInt().withMessage("memberId harus berupa angka"),
    body("division_id").notEmpty().withMessage("division_id wajib diisi").isInt().withMessage("division_id harus berupa angka"),
    body("nominal").notEmpty().withMessage("nominal wajib diisi").isNumeric().withMessage("nominal harus berupa angka"),
    body("info").optional().trim(),
  ],
  controller.addDeposit
);

router.post(
  "/deposit_saldo/get-member",
  authenticateToken,
  [body("id_cabang").trim()],
  controller.get_member
);

router.post("/info-deposit", authenticateToken, controller.infoDeposit);

module.exports = router;
