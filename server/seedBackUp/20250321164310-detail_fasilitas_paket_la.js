'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Detail_fasilitas_paket_las', [
      { 
        fasilitas_paket_la_id : 1, 
        description: 'Lorem Optum 1234jbsas', 
        check_in: new Date(), 
        check_out: new Date(),
        day: 2,
        pax: 12,
        price: 120000,  
        createdAt: new Date(), 
        updatedAt: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Detail_fasilitas_paket_las', null, {});
  }
};
