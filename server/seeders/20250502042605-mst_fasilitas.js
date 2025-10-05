'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_fasilitas', [
      { 
        company_id: 1,
        name: 'MUKENA', 
        nomor_akun_aset: '19111',
        nomor_akun_hpp: '57001',
        nomor_akun_pendapatan: '49001',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'KOPER BAGASI 24"', 
        nomor_akun_aset: '19112',
        nomor_akun_hpp: '57002',
        nomor_akun_pendapatan: '49002',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'TAS KABIN 18"', 
        nomor_akun_aset: '19113',
        nomor_akun_hpp: '57003',
        nomor_akun_pendapatan: '49003',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'TAS PASPOR', 
        nomor_akun_aset: '19114',
        nomor_akun_hpp: '57004',
        nomor_akun_pendapatan: '49004',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'BAKAL SERAGAM', 
        nomor_akun_aset: '19115',
        nomor_akun_hpp: '57005',
        nomor_akun_pendapatan: '49005',
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_fasilitas', null, {});
  }
};