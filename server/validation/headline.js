const { Headline } = require("../models");
const { getCompanyIdByCode } = require("../helper/companyHelper");

const validation = {};

validation.check_headline_id = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);
    
    const check = await Headline.findOne({ where: { id: value, company_id: company_id } });
    if (!check) {
        throw new Error("ID Headline ini tidak ditemukan dipangkalan data");
    }

    return true;
}

module.exports = validation;