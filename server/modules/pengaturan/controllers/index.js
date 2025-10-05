const Model_r = require("../models/model_r");
const Model_cud = require("../models/model_cud");
const {
  handleValidationErrors,
  handleServerError,
} = require("../../../helper/handleError");

const getCompanyInfo = async (req, res) => {
  try {
    const model_r = new Model_r(req);
    const companyIdResult = await model_r.getCompanyId();

    if (companyIdResult.error) {
      return handleValidationErrors(res, {
        error: true,
        error_msg: companyIdResult.error,
      });
    }

    const companyId = companyIdResult.companyId;
    const companyData = await model_r.get_company_by_id(companyId);

    if (companyData.error) {
      return handleValidationErrors(res, {
        error: true,
        error_msg: companyData.error,
      });
    }

    return res.status(200).json({
      error: false,
      error_msg: "Data perusahaan ditemukan.",
      company: companyData,
      companyId, // ⬅️ Tambahkan ini supaya bisa diakses di front-end jika diperlukan
    });
  } catch (error) {
    console.error("Error fetching company info:", error);
    handleServerError(res, error);
  }
};

const updateCompanySettings = async (req, res) => {
  try {
    // Ambil companyId sebelum update
    const model_r = new Model_r(req);
    const companyIdResult = await model_r.getCompanyId();

    if (companyIdResult.error) {
      return handleValidationErrors(res, {
        error: true,
        error_msg: companyIdResult.error,
      });
    }

    const companyId = companyIdResult.companyId;
    const model_cud = new Model_cud(req, companyId); // Kirim companyId ke Model_cud
    await model_cud.update();
    return model_cud.response(res);
  } catch (error) {
    console.error("Error updating company settings:", error);
    handleServerError(res, error);
  }
};

module.exports = {
  getCompanyInfo,
  updateCompanySettings,
};
