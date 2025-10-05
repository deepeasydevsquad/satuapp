"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Riwayat_pembayaran_peminjamans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      division_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Divisions",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      peminjaman_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Peminjamans",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      invoice: {
        type: Sequelize.STRING,
      },
      nominal: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["dp", "cicilan"],
        defaultValue: "cicilan",
      },
      petugas: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Riwayat_pembayaran_peminjamans");
  },
};
