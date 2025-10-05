const { body } = require("express-validator");
const { Company, Sequelize } = require("../models"); // Import Sequelize dengan benar
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// ✅ Pastikan folder upload ada sebelum menyimpan file
const uploadDir = path.join(__dirname, "../uploads/pengaturan");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Validasi untuk update company

exports.validateCompanyUpdate = [
  // Validasi currency
  body("currency")
    .isIn(["idr", "sar", "usd"])
    .withMessage("Currency must be one of: idr, sar, usd"),

  // Validasi email
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      if (!req.user || !req.user.companyId) {
        throw new Error("Unauthorized: Missing companyId");
      }

      const existingCompany = await Company.findOne({
        where: {
          email,
          id: { [Sequelize.Op.ne]: req.user.companyId }, // Exclude current company
        },
      });

      if (existingCompany) {
        throw new Error("Email is already in use by another company");
      }
    }),

  // Validasi WhatsApp number
  body("whatsapp")
    .notEmpty()
    .withMessage("WhatsApp number is required")
    .custom(async (whatsapp, { req }) => {
      if (!req.user || !req.user.companyId) {
        throw new Error("Unauthorized: Missing companyId");
      }

      const existingCompany = await Company.findOne({
        where: {
          whatsapp,
          id: { [Sequelize.Op.ne]: req.user.companyId }, // Exclude current company
        },
      });

      if (existingCompany) {
        throw new Error("WhatsApp number is already in use by another company");
      }
    }),

  // Validasi tambahan (opsional)
  body("company_name")
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 100 })
    .withMessage("Company name must be less than 100 characters"),

  body("invoice_title")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Invoice title must be less than 100 characters"),
];

// ✅ Storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Path yang benar
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "logo" || file.fieldname === "invoice_logo") {
    // Validasi untuk file PNG
    if (file.mimetype !== "image/png") {
      return cb(new Error("Logo must be a PNG file"), false);
    }
  } else if (file.fieldname === "icon") {
    // Validasi untuk file ICO
    if (file.mimetype !== "image/x-icon") {
      return cb(new Error("Icon must be an ICO file"), false);
    }
  }
  // Jika file valid, lanjutkan
  cb(null, true);
};

// ✅ Final Multer Config
exports.upload = multer({ storage, fileFilter }).fields([
  { name: "logo", maxCount: 1 },
  { name: "icon", maxCount: 1 },
  { name: "invoice_logo", maxCount: 1 },
]);
