'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Akun_bank_perusahaans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Companies",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      mst_bank_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_banks",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      nomor_akun: {
        type: Sequelize.STRING
      },
      nama_akun: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Akun_bank_perusahaans');
  }
};