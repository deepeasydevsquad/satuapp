'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_asuransis', [
      { 
        company_id: 1,
        name: 'ASURANSI MAXIMUS GRAHA PERSADA UNIT SYARIAH', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_asuransis', null, {});
  }
};