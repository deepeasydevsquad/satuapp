"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Ppob_transaction_pascabayars", [
      {
        company_id: 1,
        ppob_pascabayar_produk_id: 201,
        transaction_code: "TRXPASCABAYAR001",
        nomor_tujuan: "081234567890",
        price: 50000,
        application_price: 51000,
        company_price: 50500,
        status: "process",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        company_id: 1,
        ppob_pascabayar_produk_id: 202,
        transaction_code: "TRXPASCABAYAR002",
        nomor_tujuan: "082112223333",
        price: 75000,
        application_price: 76000,
        company_price: 75500,
        status: "success",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ppob_transaction_pascabayar", null, {});
  },
};
