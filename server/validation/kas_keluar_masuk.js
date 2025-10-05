const { Akun_secondary } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
const Model_r = require("../modules/param_cabang/models/model_r");
const validation = {};

validation.check_akun = async ( value,  { req } ) => {
    const company_id = await getCompanyIdByCode(req);
    var check = await Akun_secondary.findOne({where: { id : value, company_id: company_id }});
    if (!check) {
        throw new Error("ID Akun ini tidak ditemukan dipangkalan data");
    }
    return true;
}


validation.check_id = async ( value,  { req } ) => {
    try {
        const model = new Model_r(req);
        const listCabang = model.paramCabang();
        var list_cabang = [];
        for( let x in listCabang) {
            list_cabang.push(listCabang[x].id);
        }
        // check
        var check = await Kas_keluar_masuk.findOne( 
            { where: 
                {   
                    id : value, 
                    division_id: { 
                        [Op.in] : list_cabang
                    } 
                } 
            } 
        );
        if (!check) {
            throw new Error("ID Kas Keluar Masuk tidak ditemukan dipangkalan data");
        }
        return true;
        
    } catch (error) {
        console.log("xxxx");
        console.log(error);
        console.log("xxxx");
        return false
    }
    
}

// validation.check_id



module.exports = validation;
  