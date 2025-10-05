const moment = require("moment");
const { Op } = require("sequelize");
const { Member, Company, Division, Level_keagenan, Agen } = require("../models");
const{ getCompanyIdByCode, tipe, getCabang, getSeluruhCabangId } = require("../helper/companyHelper");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const validateIdentityNumber = async (
  division_id,
  identity_number,
  member_id = null
) => {
  const existingMember = await Member.findOne({
    where: {
      division_id,
      identity_number,
      id: { [Op.ne]: member_id },
    },
  });

  return existingMember
    ? "Nomor identitas sudah terdaftar dalam divisi ini."
    : null;
};

const validateIdentityType = (identity_type) => {
  const validTypes = ["ktp", "passport"];
  return validTypes.includes(identity_type)
    ? null
    : "Jenis identitas tidak valid. Pilih antara 'ktp' atau 'passport'.";
};

const validateBirthDate = (birth_date) => {
  return moment(birth_date, "YYYY-MM-DD", true).isValid()
    ? null
    : "Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD.";
};

const validatePhoto = (file) => {
  if (!file) return null;

  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    return "Format foto tidak valid. Hanya diperbolehkan .jpg, .jpeg, atau .png.";
  }

  const maxSize = 600 * 1024; // 600KB
  if (file.size > maxSize) {
    return "Ukuran foto terlalu besar. Maksimal 600KB.";
  }

  return null;
};

// Path upload
const uploadPath = path.join(__dirname, "../uploads/member");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  file.mimetype === "image/png"
    ? cb(null, true)
    : cb(new Error("Format file harus PNG"), false);
};

const upload = multer({ storage, fileFilter });

const validateMember = async (req) => {
  const errors = [];

  const identityError = await validateIdentityNumber(
    req.body.division_id,
    req.body.identity_number,
    req.params.id
  );
  if (identityError) errors.push(identityError);

  const identityTypeError = validateIdentityType(req.body.identity_type);
  if (identityTypeError) errors.push(identityTypeError);

  const birthDateError = validateBirthDate(req.body.birth_date);
  if (birthDateError) errors.push(birthDateError);

  const photoError = validatePhoto(req.file);
  if (photoError) errors.push(photoError);

  return errors;
};

const check_member_id = async ( id, { req } ) => {
  const company_id = await getCompanyIdByCode(req);
  var check = await Member.findOne({ 
    where: { id : id },
    include: { 
      required : true, 
      model : Division,
      where : { company_id : company_id }
    }
  });
  if (!check) {
      throw new Error("ID Member Tidak Ditemukan Dipangkalan Data");
  }
  
  return true;
}

const check_level_agen = async( level,  { req } ) => {
  const company_id = await getCompanyIdByCode(req);
  if(level !== '0') {
    var check = await Level_keagenan.findOne({ 
      where: { id : level, company_id: company_id },
    });
    if (!check) {
        throw new Error("Level Ini Tidak Ditemukan Dipangkalan Data");
    }
  }else{
    throw new Error("Anda wajib memilih salah satu level keagenan");
  }
  return true
}

const check_upline = async ( upline_id, { req } ) => {
  const id = req.body.id;
  const company_id = await getCompanyIdByCode(req);
  if( upline_id != '0'){
    var check = await Agen.findOne({ 
      where: { id : upline_id },
      include: {
        required : true, 
        model : Member, 
        include: {
          required : true,
          model : Division, 
          where : { 
            company_id: company_id
          }
        },
        where : { 
          id : { [Op.ne] : id }
        }
      }
    });
    if (!check) {
        throw new Error("Upline Ini Tidak Ditemukan Dipangkalan Data");
    }
  }
 
  return true;
}


module.exports = { validateMember, upload, check_member_id, check_level_agen, check_upline };
