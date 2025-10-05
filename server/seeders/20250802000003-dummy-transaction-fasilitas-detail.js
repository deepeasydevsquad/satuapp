'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Transaction_fasilitas_details', [
      // Detail untuk Transaksi 1
      {
        transaction_fasilitas_id: 1,
        item_fasilitas_id: 1,  
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transaction_fasilitas_id: 1,
        item_fasilitas_id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Detail untuk Transaksi 2
      {
        transaction_fasilitas_id: 2,
        item_fasilitas_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Transaction_fasilitas_details', null, {});
  }
};
