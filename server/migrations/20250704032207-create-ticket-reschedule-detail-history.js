"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Ticket_reschedule_detail_histories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ticket_reschedule_history_id: {
        type: Sequelize.INTEGER,
      },
      old_departure_date: {
        type: Sequelize.DATE,
      },
      old_travel_price: {
        type: Sequelize.INTEGER,
      },
      old_costumer_price: {
        type: Sequelize.INTEGER,
      },
      old_code_booking: {
        type: Sequelize.STRING,
      },
      new_departure_date: {
        type: Sequelize.DATE,
      },
      new_travel_price: {
        type: Sequelize.INTEGER,
      },
      new_costumer_price: {
        type: Sequelize.INTEGER,
      },
      new_code_booking: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Ticket_reschedule_detail_histories");
  },
};
