'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Fasilitas_paket_las', [
      { 
        paket_la_id : 1, 
        invoice: 'AA4A13', 
        total: 120000,
        createdAt: new Date(), 
        updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Fasilitas_paket_las', null, {});
  }
};
