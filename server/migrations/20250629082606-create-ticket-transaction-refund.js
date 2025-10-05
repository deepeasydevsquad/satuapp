'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ticket_transaction_refunds', {
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
      pax: {
        type: Sequelize.INTEGER
      },
      code_booking: {
        type: Sequelize.STRING
      },
      airlines_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_airlines",
          key: "id",
        },
        onDelete: 'CASCADE',
      },
      departure_date: {
        type: Sequelize.DATEONLY
      },
      travel_price: {
        type: Sequelize.INTEGER
      },
      costumer_price: {
        type: Sequelize.INTEGER
      },
      refund: {
        type: Sequelize.INTEGER
      },
      fee: {
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
    await queryInterface.dropTable('Ticket_transaction_refunds');
  }
};