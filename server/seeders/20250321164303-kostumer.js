'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Kostumers', [
      { 
        company_id: 1, 
        name: 'Zamzam Wisata Islami',
        mobile_number : '0862712512', 
        address : 'Medan', 
        createdAt: new Date(), 
        updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Kostumers', null, {});
  }
};
