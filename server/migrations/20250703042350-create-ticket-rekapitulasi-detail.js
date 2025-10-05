'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ticket_rekapitulasi_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticket_rekapitulasi_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Ticket_rekapitulasis",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      ticket_transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Ticket_transactions",
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
    await queryInterface.dropTable('Ticket_rekapitulasi_details');
  }
};