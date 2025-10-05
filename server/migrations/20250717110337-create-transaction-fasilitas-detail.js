'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transaction_fasilitas_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transaction_fasilitas_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Transaction_fasilitas",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      item_fasilitas_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Item_fasilitas",
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
    await queryInterface.dropTable('Transaction_fasilitas_details');
  }
};