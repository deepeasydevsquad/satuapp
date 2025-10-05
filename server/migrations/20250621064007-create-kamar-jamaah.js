'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Kamar_jamaahs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kamar_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Kamars",
          key: "id",
        },
        onDelete: 'CASCADE',
      }, 
      paket_transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Paket_transactions",
          key: "id",
        },
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('Kamar_jamaahs');
  }
};