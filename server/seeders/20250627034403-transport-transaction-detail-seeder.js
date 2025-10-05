"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Pastikan ambil ID transaksi dari AB12, misal ID = 1
    await queryInterface.bulkInsert("Transport_transaction_details", [
      {
        transport_transaction_id: 1, // ID dari transaksi AB12
        mst_mobil_id: 1, // mobil HI ACE
        car_number: "B 1234 ABC",
        travel_price: 350000,
        costumer_price: 400000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transport_transaction_id: 1,
        mst_mobil_id: 2, // mobil lainnya
        car_number: "B 5678 XYZ",
        travel_price: 400000,
        costumer_price: 450000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Transport_transaction_details", null, {});
  },
};
