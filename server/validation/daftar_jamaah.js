const { validationResult } = require("express-validator")
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
  Op,
  Jamaah,
  Member,
  Division,
} = require("../models");
const { getDivisionId } = require("../helper/companyHelper");

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
const uploadPath = path.join(__dirname, "../uploads/member");

// Pastikan folder uploads/member ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    req.body.photoPath = filename; // Simpan lokasi file di req.body.photo
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

validation.check_id_jamaah = async ( value, { req } ) => {
  const division_id = await getDivisionId(req);
  console.log('division_id:', division_id);
  console.log('value:', value);
  const check = await Jamaah.findOne({ where: { id: value, division_id: division_id } });
  if (!check) {
    throw new Error("ID Jamaah tidak terdaftar dipangkalan data");
  }
  return true;
}

validation.check_id_member = async ( value, { req } ) => {
  const division_id = await getDivisionId(req);
  const check = await Member.findOne({ where: { id: value, division_id: division_id } });
  if (!check) {
    throw new Error("ID Member tidak terdaftar dipangkalan data");
  }
  return true;
}

validation.check_id_cabang = async (value, { req }) => {
    try {
        const cabang = await Division.findOne({ where: { id: value }, attributes: ["id"] });
        if (!cabang) {
            console.debug(`ID Cabang tidak terdaftar di pangkalan data`);
            throw new Error("ID Cabang tidak terdaftar di pangkalan data");
        }

        const division_id = await getDivisionId(req);
        if (division_id != value) {
            throw new Error("ID Cabang tidak sesuai dengan ID Cabang yang login");
        }
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = validation; 