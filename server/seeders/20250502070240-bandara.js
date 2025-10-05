'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_airports', [
      { 
        company_id: 1,
        name: 'SULTAN ISKANDAR MUDA', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'KUALA NAMU', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'SOEKARNO HATTA', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'MOHAMMAD BIN  ABDULAZIZ', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'KING ABDULAZIZ', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_airports', null, {});
  }
};