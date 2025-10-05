'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Item_fasilitas', [
      {
        division_id: 1,
        item_code: 'FAS-001',
        mst_fasilitas_id: 1, // Asumsi ID 1 ada di Mst_fasilitas
        status: 'belum_terjual',
        harga_beli: 50000,
        harga_jual: 75000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        division_id: 1,
        item_code: 'FAS-002',
        mst_fasilitas_id: 2, // Asumsi ID 2 ada di Mst_fasilitas
        status: 'belum_terjual',
        harga_beli: 200000,
        harga_jual: 250000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        division_id: 1,
        item_code: 'FAS-003',
        mst_fasilitas_id: 3, // Asumsi ID 3 ada di Mst_fasilitas
        status: 'belum_terjual',
        harga_beli: 350000,
        harga_jual: 400000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        division_id: 1,
        item_code: 'FAS-004',
        mst_fasilitas_id: 1, // Asumsi ID 1 ada di Mst_fasilitas
        status: 'belum_terjual',
        harga_beli: 50000,
        harga_jual: 75000,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        division_id: 1,
        item_code: 'FAS-005',
        mst_fasilitas_id: 4, // Asumsi ID 4 ada di Mst_fasilitas
        status: 'belum_terjual',
        harga_beli: 15000,
        harga_jual: 25000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Item_fasilitas', null, {});
  }
};
