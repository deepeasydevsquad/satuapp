"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Request_deposit_members", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Companies",
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
      nominal: {
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["disetujui", "ditolak", "diproses"],
        defaultValue: "diproses",
      },
      status_note: {
        type: Sequelize.TEXT,
      },
      petugas: {
        type: Sequelize.STRING,
      },
      akun_bank_perusahaan_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Akun_bank_perusahaans",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      sending_payment_status: {
        type: Sequelize.ENUM,
        values: ["belum_dikirim", "sudah_dikirim"],
        defaultValue: "belum_dikirim",
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
    await queryInterface.dropTable("Request_deposit_members");
  },
};
