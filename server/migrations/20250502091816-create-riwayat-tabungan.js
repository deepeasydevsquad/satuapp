'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Riwayat_tabungans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoice: {
        type: Sequelize.STRING
      },
      tabungan_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Tabungans",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      nominal_tabungan: {
        type: Sequelize.INTEGER
      },
      penerima: {
        type: Sequelize.STRING
      },
      sumber_dana: {
        type: Sequelize.ENUM,
        values: ['deposit', 'cash'],
        defaultValue : "cash"
      },
      saldo_tabungan_sebelum: {
        type: Sequelize.INTEGER
      },
      saldo_tabungan_sesudah: {
        type: Sequelize.INTEGER
      },
      info_tabungan: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Riwayat_tabungans');
  }
};