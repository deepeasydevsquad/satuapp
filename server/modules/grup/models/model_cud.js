const { sequelize, Grup, Division } = require("../../../models");
const Model_r = require("./model_r");
const { writeLog } = require("../../../helper/writeLogHelper");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");
const moment = require("moment");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
    this.t; // Transaction object
    this.state = true; // State untuk menandai sukses/gagal
    this.message = ""; // Pesan log
  }

  async initialize() {
    this.company_id = await getCompanyIdByCode(this.req);
    this.t = await sequelize.transaction(); // Inisialisasi transaction
  }

  // ✅ Validasi Input
  validateInput(data) {
    if (!data.division_name || !data.name || !data.group_acces) {
      throw new Error(
        "Data tidak lengkap. Harap isi semua field yang diperlukan."
      );
    }
  }

  // ✅ Tambah Grup
  async add() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const { division_name, name, group_acces } = this.req.body;

    try {
      this.validateInput({ division_name, name, group_acces });

      // Cek divisi berdasarkan nama
      const division = await Division.findOne({
        where: { name: division_name },
      });
      if (!division) {
        throw new Error(
          `Divisi dengan nama "${division_name}" tidak ditemukan.`
        );
      }

      // Insert process
      const insert = await Grup.create(
        {
          division_id: division.id,
          name,
          group_access: JSON.stringify(group_acces),
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // Set log message
      this.message = `Menambahkan Grup Baru dengan Nama: ${name}, Divisi: ${division_name}, dan ID Grup: ${insert.id}`;

      // Write log
      await writeLog(this.req, this.t, {
        msg: this.message,
      });

      // Commit transaction
      await this.t.commit();
      return { success: true, data: insert };
    } catch (error) {
      // Rollback transaction jika terjadi error
      await this.t.rollback();
      console.error("Error saat menambahkan grup:", error.message);
      return { success: false, error: error.message };
    }
  }

  // ✅ Update Grup
  async update() {
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const { id, division_name, name, group_access } = this.req.body;

    try {
      if (!id) {
        throw new Error("ID grup harus disertakan untuk update.");
      }

      // Cari ID divisi berdasarkan nama
      const division = await Division.findOne({
        where: { name: division_name },
      });
      if (!division) {
        throw new Error(
          `Divisi dengan nama "${division_name}" tidak ditemukan.`
        );
      }

      // Cek apakah grup ada di database
      const grup = await Grup.findByPk(id);
      if (!grup) {
        throw new Error(`Grup dengan ID "${id}" tidak ditemukan.`);
      }

      // Update process
      const [affectedRows] = await Grup.update(
        {
          division_id: division.id,
          name,
          group_access: JSON.stringify(group_access),
          updatedAt: myDate,
        },
        {
          where: { id },
          transaction: this.t,
        }
      );

      console.log("Rows affected:", affectedRows);
      if (affectedRows === 0) {
        throw new Error(
          `Update gagal: Tidak ada perubahan data untuk Grup ID ${id}.`
        );
      }

      // Set log message
      this.message = `Memperbarui Data Grup dari Nama: ${grup.name}, Divisi: ${division_name}, ID: ${id} menjadi Nama: ${name}, Divisi: ${division_name}`;

      // Write log
      await writeLog(this.req, this.t, { msg: this.message });

      // Commit transaction
      await this.t.commit();
      return { success: true, message: "Grup berhasil diperbarui." };
    } catch (error) {
      // Rollback transaction jika terjadi error
      await this.t.rollback();
      console.error("Error saat mengupdate grup:", error.message);
      return { success: false, error: error.message };
    }
  }

  // ✅ Delete Grup
  async delete() {
    await this.initialize();
    const { id } = this.req.body;

    try {
      if (!id) {
        throw new Error("ID grup diperlukan untuk delete.");
      }

      // Cek apakah grup ada
      const grup = await Grup.findByPk(id);
      if (!grup) {
        throw new Error(`Grup dengan ID "${id}" tidak ditemukan.`);
      }

      // Delete process
      await Grup.destroy({
        where: { id },
        transaction: this.t,
      });

      // Set log message
      this.message = `Menghapus Grup dengan Nama: ${grup.name}, ID: ${id}`;

      // Write log
      await writeLog(this.req, this.t, {
        msg: this.message,
      });

      // Commit transaction
      await this.t.commit();
      return {
        success: true,
        message: `Grup dengan ID "${id}" berhasil dihapus.`,
      };
    } catch (error) {
      // Rollback transaction jika terjadi error
      await this.t.rollback();
      console.error("Error saat menghapus grup:", error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Model_cud;
