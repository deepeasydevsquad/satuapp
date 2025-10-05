const { Periode, Division, Akun_secondary, Mst_bank, Paket, Kostumer } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");
const validation = {};

validation.check_akun_id = async ( value,  { req } ) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        if(value != '0') {
            var check = await Akun_secondary.findOne({where: { id : value, company_id: company_id }});
            if (!check) {
                throw new Error("ID Akun ini tidak ditemukan dipangkalan data");
            }
        }    
    } catch (error) {
        console.log("--------");
        console.log(error);
        console.log("--------");
    }
    
    return true;
}

validation.check_cabang_id = async ( value,  { req } ) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        if(value != '0') {
            var check = await Division.findOne({where: { id : value, company_id: company_id }});
            if (!check) {
                throw new Error("ID Cabang ini tidak ditemukan dipangkalan data");
            }
        }    
    } catch (error) {
        console.log("--------1");
        console.log(error);
        console.log("--------1");
    }
    
    return true;
}

validation.check_periode_id = async ( value,  { req } ) => {
    try {
        const company_id = await getCompanyIdByCode(req);
        if(value != '0') {
            var check = await Periode.findOne({where: { id : value, company_id: company_id }});
            if (!check) {
                throw new Error("ID Periode ini tidak ditemukan dipangkalan data");
            }
        }    
    } catch (error) {
        console.log("--------1");
        console.log(error);
        console.log("--------1");
    }
    
    return true;
}

validation.check_sumber_dana = async ( value,  { req} ) => {
    try {
        if(value != 0){
            const company_id = await getCompanyIdByCode(req);
            const check = await Mst_bank.findOne({
                where: { id: value, company_id },
            });
            // check
            if (!check) {
                throw new Error("ID sumber dana tidak terdaftar di pangkalan data.");
            }
        }    
    } catch (error) {
        console.log("--------1");
        console.log(error);
        console.log("--------1");
    }
    
    return true;
}

validation.check_kostumer = async ( value,  { req } ) => {
    try {
        if( value != 0) {
            const company_id = await getCompanyIdByCode(req);
            const check = await Kostumer.findOne({
                where: { id: value, company_id },
            });
            // check
            if (!check) {
                throw new Error("ID kostumer tidak terdaftar di pangkalan data.");
            }
        }    
    } catch (error) {
        console.log("--------1");
        console.log(error);
        console.log("--------1");
    }
    
    return true;
}

validation.check_paket = async ( value,  { req } ) => {
    try {
        if( value != 0) {
            const company_id = await getCompanyIdByCode(req);
            const check = await Paket.findOne({
                where: { id: value },
                include: {
                    model: Division,
                    required: true,
                    where: { company_id }
                }
            });
            // check
            if (!check) {
                throw new Error("ID paket tidak terdaftar di pangkalan data.");
            }
        }    
    } catch (error) {
        console.log("--------1");
        console.log(error);
        console.log("--------1");
    }
    
    return true;
}

module.exports = validation;
  