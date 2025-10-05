'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Refund_tabungans', {
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
      nominal_ditahan: {
        type: Sequelize.INTEGER
      },
      nominal_refund: {
        type: Sequelize.INTEGER
      },
      petugas_refund: {
        type: Sequelize.STRING
      },
      info: {
        type: Sequelize.TEXT
      },
      saldo_tabungan_sebelum: {
        type: Sequelize.INTEGER
      },
      saldo_tabungan_sesudah: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Refund_tabungans');
  }
};