const { Division } = require("../models"); // Model Division
const jwt = require("jsonwebtoken");

const divisionHelper = {};

divisionHelper.getDivisionByCode = async (code) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        const decoded = jwt.decode(token);
        const company_code = decoded.company_code;
        
        const division = await Division.findOne({
            where: { code },
        });
        return division;
    } catch (error) {
        throw new Error(error.message);
    }
};


module.exports = divisionHelper;