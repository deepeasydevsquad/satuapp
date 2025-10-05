"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Akun_bank_administrators",
      [
        {
          bank_name: "BCA",
          account_bank_name: "PT AMRA SAAS",
          account_bank_number: "1234567890",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          bank_name: "Mandiri",
          account_bank_name: "PT AMRA TRAVEL",
          account_bank_number: "9876543210",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          bank_name: "BRI",
          account_bank_name: "PT AMRA INDONESIA",
          account_bank_number: "1122334455",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Akun_bank_administrators", null, {});
  },
};
