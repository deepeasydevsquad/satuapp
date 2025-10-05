"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Request_deposit_companies", {
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
      request_code: {
        type: Sequelize.STRING,
      },
      bank: {
        type: Sequelize.STRING,
      },
      number_account_bank: {
        type: Sequelize.STRING,
      },
      name_account_bank: {
        type: Sequelize.STRING,
      },
      nominal: {
        type: Sequelize.INTEGER,
      },
      nominal_code: {
        type: Sequelize.INTEGER,
      },
      sending_payment_status: {
        type: Sequelize.ENUM,
        values: ["sudah_dikirim", "belum_dikirim"],
        defaultValue: "belum_dikirim",
      },
      sending_payment_time: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["disetujui", "ditolak", "diproses"],
        defaultValue: "diproses",
      },
      status_node: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Request_deposit_companies");
  },
};
