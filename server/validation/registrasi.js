const { Company, Otp, Member, Division, Amra_setting } = require("../models");
const moment = require("moment");
    
const validation = {};

/* 
    Fungsi untuk mengecek harga berlangganan didalam databases
*/
validation.check_price = async ( value ) => {
    const settings = await Amra_setting.findOne({
        attributes: ["value"],
        where: { name: "harga_langganan" },
    });
    const packagePrice = settings ? parseInt(settings.value, 10) : 0;
    if (packagePrice <= 0) {
        throw new Error("Harga langganan tidak valid.");
    }

    return true;
}

/* 
    Fungsi untuk mengecek apakah email sudah terdaftar sebelumnya didalam database
*/
validation.check_email_perusahaan = async ( email_perusahaan,  { req } ) => {
    const check = await Company.findOne({
        where: { email: email_perusahaan },
    });
    if (check) {
        throw new Error("Email ini sudah terdaftar dipangkalan data.");
    }
    return true;
}

/* 
    Fungsi untuk mengecek apakah nomor whatsapp sudah terdaftar sebelumnya didalam database
*/
validation.check_whatsapp_company_number = async ( whatsapp_company_number ) => {
    const check = await Company.findOne({
        where: { whatsapp_company_number: whatsapp_company_number },
    });
    if (check) {
        throw new Error("Nomor whatsapp ini sudah terdaftar dipangkalan data.");
    }
    return true;
}

/* 
    Fungsi untuk mengecek apakah username sudah terdaftar sebelumnya didalam database
*/
validation.check_username = async ( username ) => {
    var check = await Company.findOne({
        where: { username: username },
    });
    if (check) {
        throw new Error("Username ini sudah terdaftar dipangkalan data.");
    }
    return true;
}

/* 
    Fungsi untuk mengecek apakah token terdaftar didalam database dan
    mengecek apakah token masih active dan belum expired
*/
validation.check_token = async ( token, { req } ) => {

    var expired_time = '';
    const body = req.body;
    const now = moment();
    const otpRecord = await Otp.findOne({
        where: {
            mobile_number: body.whatsapp_company_number,
            otp_code: token,
            otp_status: "active",
            otp_type: 'registration'
        },
    }).then(async (e) => {
        if (e) {
            expired_time = e.expired_time;
        }
    });
    // filter
    if (otpRecord) {
        throw new Error("OTP tidak valid.");
    }
    // check tanggal sudah expired atau belum
    if (moment(expired_time, "YYYY-MM-DD HH:mm:ss").isBefore(now)) {
        throw new Error("OTP sudah kadaluarsa");
    }

    return true;
}

module.exports = validation;
  