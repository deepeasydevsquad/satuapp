'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Level_keagenans', [
      { 
        company_id: 1,
        name: 'Normal',
        level: 1, 
        default_fee : 20000,  
        createdAt: new Date(), 
        updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Level_keagenans', null, {});
  }
};
