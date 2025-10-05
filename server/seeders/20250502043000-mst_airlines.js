'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_airlines', [
      { 
        company_id: 1,
        name: 'GARUDA', 
        nomor_akun_deposit: '12002',
        nomor_akun_pendapatan: '42002',
        nomor_akun_hpp: '51002', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        company_id: 1,
        name: 'BATIK AIR',
        nomor_akun_deposit: '12003',
        nomor_akun_pendapatan: '42003',
        nomor_akun_hpp: '51003', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_airlines', null, {});
  }
};