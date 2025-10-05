'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Passport_transactions', [
      { 
        division_id: 1,
        invoice: 'ER21DH',
        petugas: 'Sony Kurniawan',
        kostumer_id: 1,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Passport_transactions', null, {});
  }
};
