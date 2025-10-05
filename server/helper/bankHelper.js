const { Op, Mst_bank } = require("../models"); // Model Bank

const bankHelper = {};

// Mencari bank_id berdasarkan nama bank
bankHelper.getBankIdByName = async (bank_name) => {
    try {
        const bank = await Mst_bank.findOne({
            where: { name: { [Op.like]: `%${bank_name}%` } },
            attributes: ["id"], // Ambil ID bank saja
        });

        return bank ? bank.id : null;
    } catch (error) {
        console.error("Error fetching bank ID by name:", error.message);
        throw error;
    }
};

// Mencari nama bank berdasarkan bank_id
bankHelper.getBankNameById = async (bank_id) => {
    try {
        const bank = await Mst_bank.findOne({
            where: { id: bank_id },
            attributes: ["name"], // Ambil nama bank saja
        });

        return bank ? bank.name : null;
    } catch (error) {
        console.error("Error fetching bank name by ID:", error.message);
        throw error;
    }
};

module.exports = bankHelper;