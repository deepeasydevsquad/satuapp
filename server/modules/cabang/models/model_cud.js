const { sequelize, Division, Mst_kota, Company } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const { writeLog } = require("../../../helper/writeLogHelper");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id = null;
    this.t = null; // Sequelize transaction
    this.state = true;
    this.message = "";
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.t = await sequelize.transaction();
  }

  async validateCityId(cityId) {
    return (await Mst_kota.findByPk(cityId)) !== null;
  }

  validateSignatureFile(file) {
    if (!file) return "Tanda tangan wajib diunggah.";
    if (file.mimetype !== "image/png") return "File harus berformat PNG.";
    if (file.size > 1024 * 1024) return "Ukuran file maksimal 1MB.";
    return null;
  }

  async createDivision() {
    await this.initialize();

    const { city, name, pos_code, address, note } = this.req.body;
    const file = this.req.file;

    try {
      if (!this.company_id) throw new Error("ID perusahaan tidak ditemukan.");

      const fileError = this.validateSignatureFile(file);
      if (fileError) throw new Error(fileError);

      const cityData = await Mst_kota.findOne({ where: { id: city } });
      if (!cityData) throw new Error("ID kota tidak valid.");

      const division = await Division.create({
        company_id: this.company_id,
        kota_id: city,
        name,
        pos_code,
        address,
        note,
        tanda_tangan: file.filename,
      }, { transaction: this.t });

      this.message = `Menambahkan Division Baru dengan Nama Kota: ${cityData.name}, Kode Pos: ${pos_code}, dan ID Division: ${division.id}`;

      await writeLog(this.req, this.t, { msg: this.message });
      await this.t.commit();

      return { success: true, data: division };
    } catch (error) {
      if (this.t) await this.t.rollback();
      console.error("Error saat menambahkan division:", error.message);
      return { success: false, error: error.message };
    }
  }

  async updateDivision(id) {
    await this.initialize();
    const { city_id, name, pos_code, address, note } = this.req.body;
    const file = this.req.file;

    try {
      if (!this.company_id) throw new Error("ID perusahaan tidak ditemukan.");

      const division = await Division.findOne({
        where: { id, company_id: this.company_id },
      });
      if (!division) throw new Error("Division tidak ditemukan.");

      if (!(await this.validateCityId(city_id))) throw new Error("ID kota tidak valid.");

      const cityData = await Mst_kota.findOne({ where: { id: city_id } });
      if (!cityData) throw new Error("Kota tidak ditemukan.");

      const datas = {
        kota_id: city_id,
        name,
        pos_code,
        address,
        note,
      };

      if (file) {
        const fileError = this.validateSignatureFile(file);
        if (fileError) throw new Error(fileError);
        datas.tanda_tangan = file.filename;
      }

      await Division.update(datas, {
        where: { id, company_id: this.company_id },
        transaction: this.t,
      });

      this.message = `Memperbaharui Data Division dengan ID: ${id}, Nama Kota: ${cityData.name}, Kode Pos: ${pos_code}`;
      await writeLog(this.req, this.t, { msg: this.message });
      await this.t.commit();

      return { success: true, data: datas };
    } catch (error) {
      if (this.t) await this.t.rollback();
      console.error("Error saat mengupdate division:", error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteDivision(id) {
    await this.initialize();

    try {
      if (!this.company_id) throw new Error("ID perusahaan tidak ditemukan.");

      const totalCabang = await Division.count({
        where: { company_id: this.company_id },
      });
      if (totalCabang <= 1) {
        throw new Error("Minimal harus ada 1 cabang yang tersisa.");
      }

      const adminCabang = await Company.findOne({
        where: { id: this.company_id },
        attributes: ["division_id"],
      });

      if (adminCabang && adminCabang.division_id === id) {
        throw new Error("Cabang tempat admin berada tidak dapat dihapus.");
      }

      const division = await Division.findOne({
        where: { id, company_id: this.company_id },
      });
      if (!division) throw new Error("Division tidak ditemukan.");

      await division.destroy({ transaction: this.t });

      this.message = `Menghapus Division dengan ID: ${id}, Nama Kota: ${division.city}`;
      await writeLog(this.req, this.t, { msg: this.message });
      await this.t.commit();

      return { success: true, message: "Division berhasil dihapus." };
    } catch (error) {
      if (this.t) await this.t.rollback();
      console.error("Error saat menghapus division:", error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Model_cud;
