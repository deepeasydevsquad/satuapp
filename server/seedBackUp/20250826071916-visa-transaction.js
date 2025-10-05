'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Visa_transactions', [
      {
        division_id: 1,
        mst_visa_request_type_id: 1,
        kostumer_id: null, 
        paket_id: 1, 
        invoice: 'XC12TR',
        pax: 1, 
        harga_travel: 1000000, 
        harga_costumer: 1200000, 
        petugas: 'Administrator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Visa_transactions', null, {});
  }
};
