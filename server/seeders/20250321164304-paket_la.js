'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Paket_las', [
      { 
        division_id : 1, 
        register_number: '1S3A13', 
        kostumer_id: 1, 
        client_name: 'Zamzam Wisata Islami',
        client_hp_number: '0862712512',
        client_address: 'Medan',
        status: 'active',
        discount: 0, 
        total_price: 120000, 
        total_jamaah: 40, 
        departure_date:  new Date(), 
        arrival_date:  new Date(), 
        createdAt: new Date(), 
        updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Paket_las', null, {});
  }
};
