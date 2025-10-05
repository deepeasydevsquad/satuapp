'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_hotels', [
      { 
        company_id: 1,
        kota_id: 2,
        name: 'MARIOT MEDAN', 
        desc: '',
        star: 5, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        kota_id: 1,
        name: 'KRYAD', 
        desc: '',
        star: 5, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        kota_id: 4,
        name: 'ZAHA ALMADINAH', 
        desc: '',
        star: 4, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        kota_id: 6,
        name: 'DARUTTAUHID', 
        desc: '',
        star: 5, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_hotels', null, {});
  }
};