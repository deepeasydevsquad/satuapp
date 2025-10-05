'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Suppliers', [
      {
        company_id: 1,
        name: 'PT. Kebahagian Bersama',
        address: 'Jl. Raya Jakarta Cikarang No. 1, Cikarang Utara, Cikarang, Jawa Barat',
        bank_id: 1,
        nomor_rekening: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        company_id: 1,
        name: 'PT. Mencari Jati Diri',
        address: 'Jl. Raya Jakarta Cikarang No. 2, Cikarang Utara, Cikarang, Jawa Barat',
        bank_id: 2,
        nomor_rekening: '9876543210',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        company_id: 1,
        name: 'PT. Pernah Lembur',
        address: 'Jl. Raya Jakarta Cikarang No. 1, Cikarang Utara, Cikarang, Jawa Barat',
        bank_id: 1,
        nomor_rekening: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
