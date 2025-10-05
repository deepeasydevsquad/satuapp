'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bus_jamaahs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bus_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Buses",
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
    await queryInterface.dropTable('Bus_jamaahs');
  }
};