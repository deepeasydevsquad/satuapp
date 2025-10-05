'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_visa_request_types', [
      { 
        name: 'VISA SINGGAH',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'VISA KUNJUNGAN SATU KALI PERJALANAN',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'VISA KUNJUNGAN BEBERAPA KALI PERJALANAN',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'VISA TINGGAL TERBATAS',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_visa_request_types', null, {});
  }
};
