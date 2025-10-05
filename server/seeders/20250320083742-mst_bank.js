'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_banks', [
      { 
        company_id : 1, 
        kode : 'BSI', 
        name : 'Bank Syariah Indonesia', 
        nomor_akun: '11021',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      {
        company_id : 1,
        kode : 'BNI',
        name : 'Bank Nasional Indonesia',
        nomor_akun: '11022',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_banks', null, {});
  }
};
