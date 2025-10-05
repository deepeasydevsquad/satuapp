'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ticket_reschedule_histories', {
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
      ticket_transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Ticket_transactions",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      old_total_transaction: {
        type: Sequelize.INTEGER
      },
      new_total_transaction: {
        type: Sequelize.INTEGER
      },
      invoice: {
        type: Sequelize.STRING
      },
      costumer_name: {
        type: Sequelize.STRING
      },
      costumer_identity: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Ticket_reschedule_histories');
  }
};