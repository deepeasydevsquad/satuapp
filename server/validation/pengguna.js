const { Member, Grup, Division, User } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_id_member = async ( value, { req } ) => {
    if( value ) {
        const company_id = await getCompanyIdByCode(req);
        var check = await Member.findOne({ 
            where: { 
                id : value 
            },
            include: {
                required: true, 
                model: Division,
                where: {
                    company_id: company_id
                }
            }
         });
        if (!check) {
            throw new Error("ID Member tidak terdaftar dipangkalan data");
        }
    }
    return true;
}

validation.check_id_cabang = async ( value, { req } ) => {
    const body = req.body;
    try {
        if( ! body.member_id ) {
            const company_id = await getCompanyIdByCode(req);
            var check = await Division.findOne({ where: { id : value, company_id }});
            if (!check) {
                throw new Error("ID Cabang tidak terdaftar dipangkalan data");
            }
        }    
    } catch (error) {
        console.log("_____________________");
        console.log(error);
        console.log("_____________________"); 
    }
    
    return true;
}

validation.check_id_grup = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Grup.findOne({ 
        where: { 
            id : value 
        }, 
        include: {
            required: true, 
            model: Division,
            where: {
                company_id: company_id
            }
        }});
    if (!check) {
        throw new Error("ID Grup tidak terdaftar dipangkalan data");
    }
    return true;
}

validation.check_fullname = async ( value, { req } ) => {

    if(!req.body.member_id) {
        if( !req.body.fullname ){
            throw new Error("Nama lengkap wajib diisi");
        }
    }
    return true;
}

validation.check_identity_number = async ( value, { req } ) => {
    if(!req.body.member_id) {
        if( !req.body.identity_number || req.body.identity_number == ''){
            throw new Error("Nomor identitas wajib diisi");
        }
    }
    return true;
}

validation.check_identity_type = async ( value, { req } ) => {
    var type = ['ktp','passport']
    if(!req.body.member_id) {
        if( !req.body.identity_type  || value == ''){
            throw new Error("Tipe identitas wajib diisi.");
        } else {
            if( !type.includes( value ) ) {
                throw new Error("Format tipe identitas tidak ditemukan.");
            }
        }
    }
    return true;
}

validation.check_gender = async ( value, { req } ) => {
    var gender = ['laki_laki','perempuan'];
    if(!req.body.member_id) {
        if( !req.body.gender  || value == ''){
            throw new Error("Jenis kelamin wajib diisi.");
        } else {
            if( !gender.includes( value ) ) {
                throw new Error("Format jenis kelamin tidak ditemukan.");
            }
        }
    }
    return true;
}


validation.check_birth_place = async ( value, { req } ) => {
    if(!req.body.member_id) {
        if( !req.body.birth_place  || value == ''){
            throw new Error("Tempat lahir wajib diisi.");
        } 
    }
    return true;
}

validation.check_birth_date = async ( value, { req } ) => {
    if(!req.body.member_id) {
        if( !req.body.birth_date  || value == ''){
            throw new Error("Tanggal lahir wajib diisi.");
        } 
    }
    return true;
}

validation.check_whatsapp_number = async ( value, { req } ) => {
    if(!req.body.member_id) {
        if( !req.body.whatsapp_number  || value == ''){
            throw new Error("Nomor whatsapp wajib diisi.");
        }else{
            const company_id = await getCompanyIdByCode(req);
            var check = await Member.findOne({
                where: { 
                    whatsapp_number : value
                },
                include: {
                    required: true, 
                    model: Division, 
                    where: { 
                        company_id: company_id 
                    }
                }
            });
            if (check) {
                throw new Error("Nomor ini sudah digunakan.");
            }
        }
    }
    return true;
}

validation.check_password = async ( value, { req } ) => {
    if(!req.body.member_id) {
        if( !req.body.password  || value == ''){
            throw new Error("Password wajib diisi.");
        } 
    }
    return true;
}


validation.check_id_pengguna = async ( value ) => {
    try {
        var check = await User.findOne({
            where: { 
                id : value
            },
        });
        if (!check) {
            throw new Error("ID Pengguna tidak ditemukan.");
        }
        return true 
    } catch (error) {
        console.log("---------------");
        console.log(error);
        console.log("---------------");
        return false
    }

}
 
module.exports = validation;
  