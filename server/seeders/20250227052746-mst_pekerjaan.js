'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_pekerjaans', [
      { name : 'PNS', createdAt: new Date(), updatedAt: new Date() },
      { name : 'PEGAWAI SWASTA', createdAt: new Date(), updatedAt: new Date() },
      { name : 'WIRAUSAHA', createdAt: new Date(), updatedAt: new Date() },
      { name : 'TNI/POLRI', createdAt: new Date(), updatedAt: new Date() },
      { name : 'PETANI', createdAt: new Date(), updatedAt: new Date() },
      { name : 'NELAYAN', createdAt: new Date(), updatedAt: new Date() },
      { name : 'LAINNYA', createdAt: new Date(), updatedAt: new Date() },
      { name : 'TIDAK BEKERJA', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_pekerjaans', null, {});
  }
};
