'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Mst_pendidikans', [
      { name : 'Belum Sekolah', createdAt: new Date(), updatedAt: new Date() },
      { name : 'MI/SD', createdAt: new Date(), updatedAt: new Date() },
      { name : 'SLTP/Sederajat', createdAt: new Date(), updatedAt: new Date() },
      { name : 'SLTA/Sederajat', createdAt: new Date(), updatedAt: new Date() },
      { name : 'D1/D2/D3/D4', createdAt: new Date(), updatedAt: new Date() },
      { name : 'S1', createdAt: new Date(), updatedAt: new Date() },
      { name : 'S2', createdAt: new Date(), updatedAt: new Date() },
      { name : 'S3', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mst_pendidikans', null, {});
  }
};
