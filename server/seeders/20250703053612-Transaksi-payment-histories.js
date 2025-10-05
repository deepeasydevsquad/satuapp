'use strict';

const ticket_transaction = require('../models/ticket_transaction');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Ticket_payment_histories", [
      {
        ticket_transaction_id: 1, 
        nominal: 1500000,
        invoice: 'DF23RR',
        status: 'cash',
        petugas: 'administrator',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
     ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Ticket_payment_histories", null, {});
  },
};
