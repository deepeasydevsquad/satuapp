const { Agen, Member, Division } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
    
const validation = {};

validation.check_agen_id = async ( value, { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Agen.findOne({
        where: { id : value }, 
        include: {
            required: true, 
            model: Member,
            include: {
                required: true, 
                model: Division,
                where: {
                    company_id: company_id
                }
            }
        }
    });
    if (!check) {
        throw new Error("ID Agen tidak terdaftar dipangkalan data");
    }
}

module.exports = validation;