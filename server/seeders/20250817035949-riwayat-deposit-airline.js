'use strict';

const division = require('../models/division');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.bulkInsert('Riwayat_deposit_airlines', [
      {
        division_id: 1,
        invoice: 'INV001',
        sumber_dana: 0,
        mst_airline_id: 1,
        deposit: 500000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Riwayat_deposit_airlines', null, {});
  }
};
