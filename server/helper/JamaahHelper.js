const { Jamaah, Agen, Member, Level_keagenan, Fee_agen } = require ("../models");
const JamaahHelper = {};

JamaahHelper.getJamaahInfo = async (id) => {
    try {
        const jamaah = await Jamaah.findOne({
            where: { id },
            include: [
                {
                    model: Agen,
                    include: [
                        {
                            model: Level_keagenan,
                        }
                    ]
                },
                {
                    model: Member,
                }
            ]
        })
        return jamaah;
    } catch (error) {
        console.error("Error fetching jamaah by id:", error.message);
        throw error;
    }
};

JamaahHelper.getAgenById = async (id) => {
    try {
        const agen = await Agen.findOne({
            where: { id },
            include: [
                {
                    model: Member,
                    attributes: ['id', 'fullname'],
                },
                {
                    model: Level_keagenan,
                    attributes: ['id', 'name', 'default_fee'],
                },
            ]
        })
        return agen;
    } catch (error) {
        console.error("Error fetching agen jamaah by id:", error.message);
        throw error;
    }
};

module.exports = JamaahHelper;

