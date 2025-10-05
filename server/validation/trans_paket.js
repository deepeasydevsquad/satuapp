const {
    Op,
    File_pendukung,
    Paket_transaction,
    Division
} = require("../models");

const { getDivisionId, getCompanyIdByCode } = require("../helper/companyHelper");
const helper = require("../helper/handleError");
const { validationResult, body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const validation = {};

// Path upload
const uploadPath = path.join(__dirname, "../uploads/file_pendukung");

// Pastikan folder uploads/file_pendukung ada
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadPath),
//     filename: (req, file, cb) => {
//         const filename = Date.now() + path.extname(file.originalname);
//         file.savedFilename = filename; // Simpan nama file
//         cb(null, filename);
//     },
// });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const match = file.fieldname.match(/payload\[(\d+)\]\[file\]/);
        const index = match ? match[1] : null;
        const title = req.body?.payload?.[index]?.title || file.originalname;
        const filename = Date.now() + '-' + title.replace(/\s+/g, '_') + path.extname(file.originalname);
        cb(null, filename); 
    },
});

// Filter tipe file yang diizinkan
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    console.log("file: ", file);
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        return cb(new Error("Format file harus PDF"), false);
    }
};

// Multer multiple upload
validation.upload = multer({ storage, fileFilter });

// Hapus file jika validasi gagal dan kembalikan format error seperti handleValidationErrors
validation.hapusFileJikaValidasiError = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Hapus semua file yang sudah terupload
        if (req.files && req.files.length > 0) {
            req.files.forEach((file) => {
                const filePath = path.resolve(uploadPath, file.savedFilename);
                fs.unlink(filePath, (err) => {
                if (err) console.error("❌ Gagal menghapus file:", err);
                else console.log("🧹 File dihapus karena validasi gagal:", filePath);
                });
            });
        }

        const err_msg = await helper.error_msg(errors);

        return res.status(400).json({
            status: "error",
            error: true,
            message: err_msg.replace(/<br>/g, " "),
        });
    }

    next();
};

validation.check_id_transpaket = async (value, { req }) => {
    const division_id = await getDivisionId(req);
    var check = await Paket_transaction.findOne({ where: { id : value, division_id : division_id }});
    if (!check) {
        throw new Error("ID Transaksi Paket tidak terdaftar dipangkalan data");
    }
}

// Validasi ID Cabang
validation.check_id_cabang = async (value, { req }) => {4
    const company_id = await getCompanyIdByCode(req);
    try {
        const cabang = await Division.findOne({
            where: { id: value, company_id: company_id },
            attributes: ["id"],
        });

        if (!cabang) {
            console.debug(`ID Cabang tidak terdaftar di pangkalan data`);
            throw new Error("ID Cabang tidak terdaftar di pangkalan data");
        }

        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = validation;
