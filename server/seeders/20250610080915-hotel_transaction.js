'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Hotel_transactions', [
      { 
        division_id: 1,
        kostumer_id: 1,
        paket_id: null,
        mst_hotel_id: 1, 
        invoice: 'ER21DH',
        petugas: 'Sony Kurniawan',
        check_in: '2025-01-10',
        check_out: '2025-01-15',
        tipe_kamar: 'King',
        jumlah_hari: 10, 
        jumlah_kamar: 10,
        harga_travel_kamar_per_hari: 1000000,
        harga_kostumer_kamar_per_hari: 1500000,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Hotel_transactions', null, {});
  }
};
