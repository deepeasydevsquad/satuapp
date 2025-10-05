'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Riwayat_deposit_airlines', {
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
      invoice: {
        type: Sequelize.STRING
      },
      sumber_dana: {
        type: Sequelize.INTEGER
      },
      mst_airline_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_airlines",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      deposit: {
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
    await queryInterface.dropTable('Riwayat_deposit_airlines');
  }
};