const express = require("express");
const { body } = require("express-validator");
const controllers = require("../modules/member/controllers/index");
const { authenticateToken } = require("../middleware/authenticateToken");
const { validateMember, upload, check_member_id, check_level_agen, check_upline } = require("../validation/member"); // Pastikan ini adalah class
const router = express.Router();

router.post("/member/daftarMember", 
  authenticateToken, 
  [
    body("cabang").trim().notEmpty().withMessage("Cabang tidak boleh kosong."),
    body("pageNumber").trim().notEmpty().withMessage("Page Number tidak boleh kosong."),
    body("perpage").trim().notEmpty().withMessage("Jumlah Per Page tidak boleh kosong."),
    body("search").trim(),
  ],
  controllers.list
);

router.post("/member/infoEditMember",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Member tidak boleh kosong.").custom( check_member_id ),
  ],
  controllers.infoEditMember
);

router.post("/member/delete-member", 
  authenticateToken, 
  [
    body("id").trim().notEmpty().withMessage("ID Member tidak boleh kosong.").custom( check_member_id ),
  ], 
  controllers.delete
);

router.post("/add-member",authenticateToken,upload.single("photo"),controllers.create);

router.get("/get-type", authenticateToken, controllers.getType);

router.get("/member/level-agen", authenticateToken, controllers.level_agen);

router.put("/update-member",authenticateToken, upload.single("photo"), controllers.update);

router.get("/member/get-daftar-cabang", authenticateToken, controllers.getDaftarCabang);

router.post("/member/make-an-agen",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Member tidak boleh kosong.").custom( check_member_id ),
    body("level").trim().notEmpty().withMessage("Level Agen tidak boleh kosong.").custom( check_level_agen ),
    body("upline").trim().notEmpty().withMessage("Upline tidak boleh kosong.").custom( check_upline ),
  ],
  controllers.makeAnAgen
);

router.post("/member/daftar-upline",
  authenticateToken,
  [
    body("id").trim().notEmpty().withMessage("ID Member tidak boleh kosong.").custom( check_member_id ),
  ],
  controllers.listUpline
);


module.exports = router;
