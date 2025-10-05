'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Paket_prices', [
      { 
        paket_id: 1,
        mst_paket_type_id: 1,
        price: 30000000,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        paket_id: 2,
        mst_paket_type_id: 1,
        price: 33000000,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        paket_id: 2,
        mst_paket_type_id: 2,
        price: 43000000,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        paket_id: 3,
        mst_paket_type_id: 1,
        price: 44000000,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        paket_id: 4,
        mst_paket_type_id: 1,
        price: 44000000,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Paket_prices', null, {});
  }
};