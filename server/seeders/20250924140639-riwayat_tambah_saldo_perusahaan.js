"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Request_deposit_companies",
      [
        {
          company_id: 1,
          request_code: "REQ001",
          bank: "BCA",
          number_account_bank: "1234567890",
          name_account_bank: "PT AMRA SAAS",
          nominal: 5000000,
          nominal_code: 1234,
          sending_payment_status: "sudah_dikirim",
          status: "disetujui",
          status_node: "Permintaan deposit telah disetujui oleh admin.",
          petugas: "Admin 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          company_id: 2,
          request_code: "REQ002",
          bank: "Mandiri",
          number_account_bank: "9876543210",
          name_account_bank: "PT AMRA TRAVEL",
          nominal: 3000000,
          nominal_code: 5678,
          sending_payment_status: "belum_dikirim",
          status: "diproses",
          status_node: "Menunggu konfirmasi pengiriman pembayaran.",
          petugas: "Admin 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          company_id: 1,
          request_code: "REQ003",
          bank: "BRI",
          number_account_bank: "1122334455",
          name_account_bank: "PT AMRA SAAS",
          nominal: 2000000,
          nominal_code: 4321,
          sending_payment_status: "belum_dikirim",
          status: "ditolak",
          status_node: "Permintaan deposit ditolak karena data tidak valid.",
          petugas: "Admin 3",
          sending_payment_time: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Request_deposit_companies", null, {});
  },
};
