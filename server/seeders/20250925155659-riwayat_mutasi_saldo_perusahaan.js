"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Transaction_deposit_companies",
      [
        {
          company_id: 1,
          transaction_code: "TRXDEP001",
          nominal: 5000000,
          type_transaction: "deposit",
          ket: "Deposit awal perusahaan",
          status: "approved",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          company_id: 2,
          transaction_code: "TRXDEP002",
          nominal: 3000000,
          type_transaction: "deposit",
          ket: "Deposit tambahan perusahaan",
          status: "process",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          company_id: 1,
          transaction_code: "TRXPPB001",
          nominal: 1500000,
          type_transaction: "ppob",
          ket: "PPOB:transaction_code:304500",
          status: "approved",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          company_id: 2,
          transaction_code: "TRXPPB002",
          nominal: 2000000,
          type_transaction: "ppob",
          ket: "PPOB:transaction_code:138422",
          status: "rejected",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Transaction_deposit_companies", null, {});
  },
};
