const { Headline, Request_deposit_member } = require("../models");
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

validation.check_id_permintaan_deposit_member_sudah_dikirim = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);
    
    const check = await Request_deposit_member.findOne({ where: { id: value, company_id: company_id } });
    if (!check) {
        throw new Error("ID Permintaan Deposit ini tidak ditemukan dipangkalan data");
    }

    if (check.sending_payment_status !== "sudah_dikirim") {
        throw new Error("Permintaan Deposit ini belum dikirim");
    }

    if (check.status == "disetujui") {
        throw new Error("Permintaan Deposit ini sudah disetujui");
    }

    if (check.status == "ditolak") {
        throw new Error("Permintaan Deposit ini sudah ditolak");
    }

    return true;
}

validation.check_id_permintaan_deposit_member = async (value, { req }) => {
    const company_id = await getCompanyIdByCode(req);
    const check = await Request_deposit_member.findOne({ where: { id: value, company_id: company_id } });
    if (!check) {
        throw new Error("ID Permintaan Deposit ini tidak ditemukan dipangkalan data");
    }
    
    if (check.status == "disetujui") {
        throw new Error("Permintaan Deposit ini sudah disetujui");
    }

    if (check.status == "ditolak") {
        throw new Error("Permintaan Deposit ini sudah ditolak");
    }

    return true;
}

module.exports = validation;