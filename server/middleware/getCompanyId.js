const companyHelper = require("../helper/companyHelper");

const getCompanyId = async (req, res, next) => {
  try {
    const companyCode = req.user?.company_code;
    if (!companyCode) {
      return res.status(400).json({ message: "Company code missing from token" });
    }

    const companyId = await companyHelper.getCompanyIdByCode(companyCode);
    if (!companyId) {
      return res.status(404).json({ message: "Company not found" });
    }

    req.body.company_id = companyId; // Simpan langsung ke req.body agar tidak perlu diubah di router
    next();
  } catch (error) {
    console.error("Middleware error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = getCompanyId;
