'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Passport_transaction_details', [
      { 
        passport_transaction_id: 1,
        name: 'Ilham',
        birth_date: '2000-05-01',
        birth_place: 'Langsa',
        identity_number: '171273512123',
        kk_number: '18723512873612',
        mst_kota_id: 1,
        address: 'Lorem Ipsum',
        price: 10000000,
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('t', null, {});
  }
};
