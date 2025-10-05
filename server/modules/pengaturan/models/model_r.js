const companyHelper = require("../../../helper/companyHelper"); // Sesuaikan path-nya
const { Company } = require("../../../models/"); // Import model Company dari Sequelize
const fs = require("fs");

class Model_r {
  constructor(req) {
    this.req = req;
    this.company_id = null; // Inisialisasi company_id
  }

  async getCompanyId() {
    try {
      if (!this.req) {
        throw new Error("Request object is required");
      }

      const companyId = await companyHelper.getCompanyIdByCode(this.req);
      if (!companyId) {
        return { error: "Company ID tidak ditemukan" };
      }

      this.company_id = companyId; // Simpan companyId ke dalam properti instance
      return { companyId }; // Kembalikan object yang konsisten
    } catch (error) {
      console.error("Error fetching Company ID:", error);
      return {
        error: "Terjadi kesalahan saat mengambil Company ID",
        details: error.message,
      };
    }
  }

  async get_company_by_id(companyId) {
    try {
      if (!companyId) {
        return { error: "Company ID diperlukan" };
      }

      // Menggunakan Sequelize untuk mengambil data perusahaan
      const companyData = await Company.findOne({
        where: { id: companyId },
      });

      var posisiLogo = "/uploads/pengaturan/" + companyData.logo;

      if ( ! await fs.existsSync(posisiLogo) ) {
        companyData.logo = "default.png"; // Update jika file tidak ada
      }

      if (companyData) {
        return companyData; // Mengembalikan data perusahaan
      } else {
        return { error: "Perusahaan tidak ditemukan" };
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      return {
        error: "Terjadi kesalahan saat mengambil data perusahaan",
        details: error.message,
      };
    }
  }
}

module.exports = Model_r;
