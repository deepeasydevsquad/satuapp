'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Passport_transaction_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      passport_transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Passport_transactions",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING
      },
      birth_date: {
        type: Sequelize.DATE
      },
      birth_place: {
        type: Sequelize.STRING
      },
      identity_number: {
        type: Sequelize.STRING
      },
      kk_number: {
        type: Sequelize.STRING
      },
      mst_kota_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_kota",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      address: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.INTEGER
      },
      priceCostumer: {
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
    await queryInterface.dropTable('Passport_transaction_details');
  }
};