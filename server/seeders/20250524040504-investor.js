'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Investors', [
      { 
        division_id: 1,
        name: 'Ade Afrianto',
        identity_number: '1207060804841111',
        mobile_phone: '085270593141',
        address: 'JL NAMORAMBE KM 8 GG SEHATI',
        invesment: 100000000,
        stock: 1,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Investors', null, {});
  }
};
