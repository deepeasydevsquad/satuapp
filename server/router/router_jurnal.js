const express = require("express");
const { body, param } = require("express-validator");
const controllers = require("../modules/jurnal/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const validation = require("../validation/jurnal");

const router = express.Router();

router.get(
  "/jurnal/filter",
  authenticateToken,
  controllers.filter
);

router.post(
  "/jurnal/server_side",
  authenticateToken,
  [
    body("tanggal_transaksi"),
    body("periode").trim().notEmpty().withMessage("Periode tidak boleh kosong.").custom(validation.check_periode),
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong.").custom(validation.check_cabang),
  ],
  controllers.server_side
);

router.post(
    "/jurnal/delete",
    authenticateToken,
    [ body("id").trim().notEmpty().withMessage("ID Jurnal tidak boleh kosong.").custom(validation.check_id_jurnal).custom(validation.check_hak_akses) ],
    controllers.delete
);
  
module.exports = router;
