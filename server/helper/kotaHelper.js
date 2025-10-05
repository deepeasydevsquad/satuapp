const { Op, Mst_kota } = require("../models"); // Model Kota

const kotaHelper = {};

// Mencari kota_id berdasarkan kecocokan nama kota
kotaHelper.getKotaIdByCharName = async (kota_name, company_id) => {
    try {
        const kota = await Mst_kota.findOne({
            where: {
                name: { [Op.like]: `%${kota_name}%` },
                company_id,
            },
            attributes: ["id"],
        });

        return kota ? kota.id : null;
    } catch (error) {
        console.error("Error fetching kota ID by name:", error.message);
        throw error;
    }
};

// Mencari kota_id berdasarkan nama kota
kotaHelper.getKotaIdByName = async (kota_name, company_id) => {
    try {
        const kota = await Mst_kota.findOne({
            where: { name: kota_name, company_id },
            attributes: ["id"], // Ambil ID kota saja
        });

        return kota ? kota.id : null;
    } catch (error) {
        console.error("Error fetching kota ID by name:", error.message);
        throw error;
    }
};

// Mencari nama kota berdasarkan kota_id
kotaHelper.getKotaNameById = async (kota_id) => {
    try {
        const kota = await Mst_kota.findOne({
            where: { id: kota_id },
            attributes: ["name"], // Ambil nama kota saja
        });

        return kota ? kota.name : null;
    } catch (error) {
        console.error("Error fetching kota name by ID:", error.message);
        throw error;
    }
};

module.exports = kotaHelper;
