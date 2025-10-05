const { 
  Paket,
  Division,
} = require("../models");
const { validationResult } = require("express-validator")
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const validation = {};

validation.removeUploadedFileOnValidationError = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    if (req.file) {
      const filePath = path.resolve(req.file.path)
      fs.unlink(filePath, (err) => {
        if (err) console.error("❌ Gagal menghapus file:", err)
        else console.log("🧹 File dihapus karena validasi gagal:", filePath)
      })
    }

    return res.status(422).json({ errors: errors.array() })
  }

  next()
}

// Path upload
const uploadPath = path.join(__dirname, "../uploads/daftar_paket");

// Pastikan folder uploads/member ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    req.body.photoPath = `/uploads/daftar_paket/${filename}`; // Simpan lokasi file di req.body.photo
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file harus PNG, JPG atau JPEG"), false);
  }
};

validation.upload = multer({ storage, fileFilter });

validation.check_id_cabang = async (value, { req }) => {
    try {
        const cabang = await Division.findOne({ where: { id: value }, attributes: ["id"] });
        if (!cabang) {
            console.debug(`ID Cabang tidak terdaftar di pangkalan data`);
            throw new Error("ID Cabang tidak terdaftar di pangkalan data");
        }
        
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

validation.check_id_paket = async (value, { req }) => {
  try {
    const paket = await Paket.findOne({ where: { id: value }, attributes: ["id"] });
    if (!paket) {
        console.debug(`ID Paket tidak terdaftar di pangkalan data`);
        throw new Error("ID Paket tidak terdaftar di pangkalan data");
    }
    
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = validation;
