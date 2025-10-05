'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
    // Pastikan ambil ID transaksi dari AB12, misal ID = 1
    await queryInterface.bulkInsert("Ticket_transactions", [
      {
        division_id: 1, 
        nomor_registrasi: 'XZ171668',
        airlines_id: 1, 
        kostumer_id: 1,
        paket_id: 1, 
        status: 'active',
        pax: 3,
        code_booking: 'DR32SSOO',
        travel_price: 1000000,
        costumer_price: 1200000,
        departure_date: '2025-08-22 18:43:03',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
     ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Ticket_transactions", null, {});
  },
};
