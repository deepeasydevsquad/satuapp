'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Transaction_fasilitas', [
      {
        id: 1, 
        division_id: 1,
        invoice: 'INV001',
        kostumer_id: 1,
        tabungan_id: null,
        paket_id: 1, 
        petugas: "PT. MUHANDIS QUR'ANI WISATA",
        total: 475000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2, 
        division_id: 1,
        invoice: 'INV002',
        kostumer_id: 1,
        tabungan_id: null,
        paket_id: 2,
        petugas: "PT. MUHANDIS QUR'ANI WISATA'",
        total: 250000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Transaction_fasilitas', null, {});
  }
};
