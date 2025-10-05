'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ticket_payment_histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticket_transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Ticket_transactions",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      nominal: {
         type: Sequelize.STRING
      },
      invoice: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM,
        values: ['cash', 'refund'],
        defaultValue : "cash"
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
    await queryInterface.dropTable('Ticket_payment_histories');
  }
};