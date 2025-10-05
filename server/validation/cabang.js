const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Path ke folder upload (gunakan absolute path)
const uploadPath = path.join(__dirname, "../uploads");

//🔥 Pastikan folder upload ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true }); // recursive: true supaya buat folder dalamnya juga
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Pakai path yang sudah pasti ada
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate nama file unik
  },
});

// 🔍 Filter hanya PNG
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Format file harus PNG"), false);
  }
};

// ⚡ Konfigurasi Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 }, // Maksimal 1MB
});

// ✅ Validasi berdasarkan ID kota

module.exports = upload;
