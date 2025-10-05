'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Akun_primaries', [
      { nomor_akun: '10000', nama_akun: 'Aset', sn :'D', pos : 'NRC',  createdAt: new Date(), updatedAt: new Date() },
      { nomor_akun: '20000', nama_akun: 'Kewajiban', sn :'K', pos : 'NRC',  createdAt: new Date(), updatedAt: new Date() },
      { nomor_akun: '30000', nama_akun: 'Akuitas', sn :'K', pos : 'NRC',  createdAt: new Date(), updatedAt: new Date() },
      { nomor_akun: '40000', nama_akun: 'Pendapatan', sn :'K', pos : 'LR',  createdAt: new Date(), updatedAt: new Date() },
      { nomor_akun: '50000', nama_akun: 'Biaya Penjualan', sn :'D', pos : 'LR',  createdAt: new Date(), updatedAt: new Date() },
      { nomor_akun: '60000', nama_akun: 'Pengeluaran', sn :'D', pos : 'LR',  createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Akun_primaries', null, {});
  }
};
