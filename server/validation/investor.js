const { Investor, Division, Op } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_mobile_phone = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    if(req.body.id) {
        var check = await Investor.findOne({
            where: { 
                mobile_phone : req.body.mobile_phone, 
                id: {[Op.ne] : req.body.id } 
            }, 
            include: { required : true, model: Division, where : { company_id }}
        });
        if (check) {
            throw new Error("Nomor HP ini sudah terdaftar dipangkalan data");
        }
    }else{
        var check = await Investor.findOne({
            where: { 
                mobile_phone : req.body.mobile_phone 
            },
            include: { required : true, model: Division, where : { company_id }}
        });
        if (check) {
            throw new Error("Nomor HP ini sudah terdaftar dipangkalan data");
        }
    }
    return true;
}

validation.check_id_investor = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
     var check = await Investor.findOne({where: { id : req.body.id }, include: { required : true, model: Division, where : { company_id }}});
    if (!check) {
        throw new Error("ID Investor ini tidak terdaftar dipangkalan data");
    }
    return true;
}


module.exports = validation;