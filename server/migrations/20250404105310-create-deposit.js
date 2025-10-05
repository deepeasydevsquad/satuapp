"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Deposits", {
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
      member_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Members",
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
      saldo_sebelum: {
        type: Sequelize.INTEGER,
      },
      saldo_sesudah: {
        type: Sequelize.INTEGER,
      },
      sumber_dana: {
        type: Sequelize.ENUM,
        values: ["cash", "deposit"],
        defaultValue: "cash",
      },
      penerima: {
        type: Sequelize.STRING,
      },
      tipe_transaksi: {
        type: Sequelize.ENUM,
        values: [
          "deposit",
          "pindah_ke_tabungan",
          "sisa_pembelian_paket",
          "pembelian_ppob",
        ],
        defaultValue: "deposit",
      },
      info: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Deposits");
  },
};
