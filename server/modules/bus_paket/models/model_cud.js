"use strict";
const { sequelize, Bus, Bus_jamaah } = require("../../../models");
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

  async create_bus() {
    await this.initialize();
    const {
      city_id,
      bus_number,
      kapasitas_bus,
      bus_leader,
      jamaah_ids,
      division_id,
    } = this.req.body;
    const t = await sequelize.transaction();

    try {
      const newBus = await Bus.create(
        {
          company_id: this.company_id,
          division_id: division_id, // Add division_id
          city_id: city_id,
          bus_number: bus_number,
          kapasitas_bus: kapasitas_bus,
          bus_leader: bus_leader,
        },
        { transaction: t }
      );

      if (jamaah_ids && jamaah_ids.length > 0) {
        const busJamaahData = jamaah_ids.map((paket_transaction_id) => ({
          bus_id: newBus.id,
          paket_transaction_id: paket_transaction_id,
        }));
        await Bus_jamaah.bulkCreate(busJamaahData, { transaction: t });
      }

      await t.commit();
      return { success: true, message: "Bus berhasil ditambahkan." };
    } catch (error) {
      await t.rollback();
      console.error("Error di model_cud create_bus:", error);
      throw new Error("Gagal saat menyimpan data bus ke database.");
    }
  }

  async update_bus(id) {
    await this.initialize();
    const {
      city_id,
      bus_number,
      kapasitas_bus,
      bus_leader,
      jamaah_ids,
      division_id,
    } = this.req.body;

    const t = await sequelize.transaction();
    try {
      const busToUpdate = await Bus.findByPk(id, { transaction: t });
      if (!busToUpdate) {
        throw new Error("Bus tidak ditemukan untuk diperbarui.");
      }

      await busToUpdate.update(
        {
          city_id: city_id,
          bus_number: bus_number,
          kapasitas_bus: kapasitas_bus,
          bus_leader: bus_leader,
          division_id: division_id, // Add division_id
        },
        { transaction: t }
      );

      await Bus_jamaah.destroy({ where: { bus_id: id }, transaction: t });

      if (jamaah_ids && jamaah_ids.length > 0) {
        const busJamaahData = jamaah_ids.map((paket_transaction_id) => ({
          bus_id: id,
          paket_transaction_id: paket_transaction_id,
        }));
        await Bus_jamaah.bulkCreate(busJamaahData, { transaction: t });
      }

      await t.commit();
      return { success: true, message: "Bus berhasil diperbarui." };
    } catch (error) {
      await t.rollback();
      console.error("Error di model_cud update_bus:", error);
      throw new Error("Gagal saat memperbarui data bus ke database.");
    }
  }

  async delete_bus(id) {
    await this.initialize();

    const t = await sequelize.transaction();
    try {
      const busToDelete = await Bus.findOne({
        where: {
          id: id,
          company_id: this.company_id,
        },
        transaction: t,
      });

      if (!busToDelete) {
        throw new Error(
          "Bus tidak ditemukan atau Anda tidak memiliki akses untuk menghapus."
        );
      }

      await Bus_jamaah.destroy({
        where: { bus_id: id },
        transaction: t,
      });

      await busToDelete.destroy({ transaction: t });

      await t.commit();
      return { success: true, message: "Bus berhasil dihapus." };
    } catch (error) {
      await t.rollback();
      console.error("Error di model_cud delete_bus:", error);
      throw new Error("Gagal saat menghapus data bus dari database.");
    }
  }
}

module.exports = model_cud;
