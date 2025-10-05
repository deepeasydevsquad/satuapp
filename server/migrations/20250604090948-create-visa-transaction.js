'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Visa_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      division_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Divisions",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      mst_visa_request_type_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_visa_request_types",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      kostumer_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Kostumers",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      paket_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Pakets",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      invoice: {
        type: Sequelize.STRING
      },
      pax: {
        type: Sequelize.INTEGER
      },
      harga_travel: {
        type: Sequelize.INTEGER
      },
      harga_costumer: {
        type: Sequelize.INTEGER
      },
      petugas: {
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
    await queryInterface.dropTable('Visa_transactions');
  }
};