'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_paket_types', [
      { 
        company_id: 1,
        name: 'Normal', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'Premium', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_paket_types', null, {});
  }
};
