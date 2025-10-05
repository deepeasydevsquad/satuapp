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

module.exports = bankHelper;