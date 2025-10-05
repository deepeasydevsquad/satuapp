const { body } = require("express-validator");

exports.validatePengaturanWhatsapp = () => [
  body("whatsapp_number")
    .optional({ nullable: true })
    .isMobilePhone("id-ID")
    .withMessage("Nomor Whatsapp tidak valid"),

  // Kalau device_key dikirim, api_key harus ada juga
  body("device_key").custom((value, { req }) => {
    if (value && !req.body.api_key) {
      throw new Error("Jika device_key dikirim, api_key juga harus dikirim");
    }
    return true;
  }),

  // Kalau api_key dikirim, device_key harus ada juga
  body("api_key").custom((value, { req }) => {
    if (value && !req.body.device_key) {
      throw new Error("Jika api_key dikirim, device_key juga harus dikirim");
    }
    return true;
  }),
];
