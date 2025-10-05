"use strict";
const { sequelize, Kamar, Kamar_jamaah } = require("../../../models");
const { getCompanyIdByCode } = require("../../../helper/companyHelper");

class model_cud {
  constructor(req) {
    this.req = req;
    this.company_id;
  }

  async initialize() {
    if (!this.company_id) {
      this.company_id = await getCompanyIdByCode(this.req);
    }
  }

  async create_kamar() {
    await this.initialize();
    const { hotel_id, tipe_kamar, kapasitas_kamar, jamaah_ids } = this.req.body;
    const t = await sequelize.transaction();

    try {
      const formattedTipeKamar = tipe_kamar.toLowerCase().replace("-", "_");

      const newKamar = await Kamar.create(
        {
          company_id: this.company_id,
          hotel_id: hotel_id,
          tipe_kamar: formattedTipeKamar,
          kapasitas_kamar: kapasitas_kamar,
        },
        { transaction: t }
      );

      if (jamaah_ids && jamaah_ids.length > 0) {
        const kamarJamaahData = jamaah_ids.map((paket_transaction_id) => ({
          kamar_id: newKamar.id,
          paket_transaction_id: paket_transaction_id,
        }));
        await Kamar_jamaah.bulkCreate(kamarJamaahData, { transaction: t });
      }

      await t.commit();
      return { success: true, message: "Kamar berhasil ditambahkan." };
    } catch (error) {
      await t.rollback();
      console.error("Error di model_cud create_kamar:", error);
      throw new Error("Gagal saat menyimpan data kamar ke database.");
    }
  }

  async update_kamar(id) {
    await this.initialize();
    const { hotel_id, tipe_kamar, kapasitas_kamar, jamaah_ids } = this.req.body;

    const t = await sequelize.transaction();
    try {
      const kamarToUpdate = await Kamar.findByPk(id, { transaction: t });
      if (!kamarToUpdate) {
        throw new Error("Kamar tidak ditemukan untuk diperbarui.");
      }

      const formattedTipeKamar = tipe_kamar.toLowerCase().replace("-", "_");

      await kamarToUpdate.update(
        {
          hotel_id: hotel_id,
          tipe_kamar: formattedTipeKamar,
          kapasitas_kamar: kapasitas_kamar,
        },
        { transaction: t }
      );

      await Kamar_jamaah.destroy({ where: { kamar_id: id }, transaction: t });

      if (jamaah_ids && jamaah_ids.length > 0) {
        const kamarJamaahData = jamaah_ids.map((paket_transaction_id) => ({
          kamar_id: id,
          paket_transaction_id: paket_transaction_id,
        }));
        await Kamar_jamaah.bulkCreate(kamarJamaahData, { transaction: t });
      }

      await t.commit();
      return { success: true, message: "Kamar berhasil diperbarui." };
    } catch (error) {
      await t.rollback();
      console.error("Error di model_cud update_kamar:", error);
      throw new Error("Gagal saat memperbarui data kamar.");
    }
  }

  async delete_kamar(id) {
    await this.initialize();

    const t = await sequelize.transaction();
    try {
      const kamarToDelete = await Kamar.findOne({
        where: {
          id: id,
          company_id: this.company_id,
        },
        transaction: t,
      });

      if (!kamarToDelete) {
        throw new Error(
          "Kamar tidak ditemukan atau Anda tidak memiliki akses untuk menghapus."
        );
      }

      await Kamar_jamaah.destroy({
        where: { kamar_id: id },
        transaction: t,
      });

      await kamarToDelete.destroy({ transaction: t });

      await t.commit();
      return { success: true, message: "Kamar berhasil dihapus." };
    } catch (error) {
      await t.rollback();
      console.error("Error di model_cud delete_kamar:", error);
      throw new Error("Gagal saat menghapus data kamar dari database.");
    }
  }
}

module.exports = model_cud;
