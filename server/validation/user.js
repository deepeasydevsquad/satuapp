const { Company, Member, Division } = require("../models");
    
const validation = {};

validation.company_code_login_process = async ( value,  { req } ) => {
    const body = req.body;
    if(body.type === 'staff' && value == '') {
        throw new Error("Kode Perusahaan Tidak Boleh Kosong Jika Anda Masuk Sebagai Staff.");
    }
    return true;
}

validation.nomor_whatsapp_login_process = async ( value , { req } ) => {
    const body = req.body;
    if( body.type == 'staff' ) {
        if( value != '') {
            var check = await Member.findOne({
                where: { whatsapp_number: value },
                include: {
                    required : true, 
                    model: Division, 
                    include : {
                        required : true, 
                        model: Company, 
                        where: {
                            code: body.company_code
                        }
                    }
                }
            });
            if (!check) {
                throw new Error("Terdapat kesalahan pada nomor whatsapp atau password anda.");
            }
        }else{
            throw new Error("Username tidak boleh kosong.");
        }   
    }
    return true;
}

validation.username_login_process = async (value,  { req } ) => {
    const body = req.body;
    if( body.type == 'administrator' ) {
        if( value != '') {
            var check = await Company.findOne({
                where: { username: value },
            });
            if (!check) {
                throw new Error("Terdapat kesalahan pada username atau password anda.");
            }
        }else{
            throw new Error("Username tidak boleh kosong.");
        }   
    }
    return true;
}

module.exports = validation;
  