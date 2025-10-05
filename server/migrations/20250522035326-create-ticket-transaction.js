'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ticket_transactions', {
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
      nomor_registrasi: {
        type: Sequelize.STRING
      },
      airlines_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Mst_airlines",
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
      status: {
        type: Sequelize.ENUM,
        values: ['active', 'refund', 'cancel'],
        defaultValue : "active"
      },
      pax: {
        type: Sequelize.INTEGER
      },
      code_booking: {
        type: Sequelize.STRING
      },
      travel_price: {
        type: Sequelize.INTEGER
      },
      costumer_price: {
        type: Sequelize.INTEGER
      },
      departure_date: {
        type: Sequelize.DATEONLY
      },
      arrival_date: {
        type: Sequelize.DATEONLY
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
    await queryInterface.dropTable('Ticket_transactions');
  }
};