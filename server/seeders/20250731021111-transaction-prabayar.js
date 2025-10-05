"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Ppob_transaction_prabayars", [
      {
        company_id: 1,
        ppob_prabayar_produk_id: 104,
        transaction_code: "TRXPRABAYAR001",
        nomor_tujuan: "081234567890",
        price: 10000,
        application_price: 10500,
        company_price: 10200,
        status: "success",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        ppob_prabayar_produk_id: 107,
        transaction_code: "TRXPRABAYAR002",
        nomor_tujuan: "089876543210",
        price: 20000,
        application_price: 21000,
        company_price: 20500,
        status: "failed",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ppob_transaction_prabayar", null, {});
  },
};
